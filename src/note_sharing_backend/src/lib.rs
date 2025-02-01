use ic_cdk::{export_candid, query, update, api};
use serde::{Deserialize, Serialize};
use candid::{CandidType, Encode, Decode};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    Storable, StableBTreeMap, DefaultMemoryImpl, storable::Bound
};
use uuid::Uuid;
use ic_cdk::api::management_canister::main::raw_rand;
use std::convert::TryInto;
use std::{borrow::Cow, cell::RefCell};
type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Serialize, Deserialize, Clone)]
struct Note {
    id: String,
    content: String,
    owner: String,
    shared_with: Vec<String>,
}

impl Storable for Note {
    const BOUND : Bound = Bound::Unbounded;
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default()));
    static NOTES: RefCell<StableBTreeMap<String, Note, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
}

async fn generate_128bit_random() -> Result<u128, String> {
    let (random_bytes,) = raw_rand()
        .await
        .map_err(|e| format!("Failed to get random bytes: {:?}", e))?;

    // Ensure we have 16 bytes (128 bits)
    if random_bytes.len() < 16 {
        return Err("Insufficient random bytes".to_string());
    }

    // Convert the first 16 bytes into a u128 value
    let random_value = u128::from_le_bytes(random_bytes[..16].try_into().unwrap());

    Ok(random_value)
}

#[query]
fn get_notes() -> Vec<Note> {
    let caller = api::caller().to_string();
    NOTES.with(|notes| {
        notes.borrow().iter()
            .map(|(_, note)| note.clone())
            .filter(|note| note.owner == caller || note.shared_with.contains(&caller))
            .collect()
    })
}

#[query]
fn get_note_by_id(id: String) -> Option<Note> {
    let caller = api::caller().to_string();
    NOTES.with(|notes| {
        notes.borrow().get(&id).filter(|note| note.owner == caller || note.shared_with.contains(&caller))
    })
}

#[update]
async fn add_note(content: String)->Result<String,String> {
    
    let random_number = match generate_128bit_random().await {
        Ok(num) => num,
        Err(_) => 0, // Default value in case of error
    };
    if random_number == 0 {
        return Err("Something went wrong try again".to_string());
    }
    let new_uuid = Uuid::from_u128(random_number);
    let note = Note {
        id: new_uuid.to_string() ,
        content,
        owner: api::caller().to_string(),
        shared_with: Vec::new(),
    };
    NOTES.with(|notes| {
        notes.borrow_mut().insert(new_uuid.to_string(), note);
    });
    return Ok("success".to_string());
}

#[update]
fn update_note(id: String, content: String) -> Result<String, String> {
    let caller = api::caller().to_string();
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        if let Some(mut note) = notes.get(&id) {
            if note.owner == caller {
                note.content = content;
                notes.insert(id, note);
                Ok("Note updated successfully".to_string())
            } else {
                Err("Permission denied: Only the owner can update the note".to_string())
            }
        } else {
            Err("Note not found".to_string())
        }
    })
}

#[update]
fn delete_note(id: String) -> Result<String, String> {
    let caller = api::caller().to_string();
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        if let Some(note) = notes.get(&id) {
            if note.owner == caller {
                notes.remove(&id);
                Ok("Note has been deleted.".to_string())
            } else {
                Err("Permission denied: Only the owner can delete the note".to_string())
            }
        } else {
            Err("No note found.".to_string())
        }
    })
}

#[update]
fn share_note(id: String, user: String) -> Result<String, String> {
    let caller = api::caller().to_string();
    NOTES.with(|notes| {
        let mut notes = notes.borrow_mut();
        if let Some(mut note) = notes.get(&id) {
            if note.owner == caller {
                if !note.shared_with.contains(&user) {
                    note.shared_with.push(user);
                    notes.insert(id, note);
                    Ok("Note shared successfully.".to_string())
                } else {
                    Err("User already has access to this note.".to_string())
                }
            } else {
                Err("Permission denied: Only the owner can share the note.".to_string())
            }
        } else {
            Err("Note not found.".to_string())
        }
    })
}

#[query]
fn get_notes_by_owner(owner: String) -> Vec<Note> {
    NOTES.with(|notes| {
        notes.borrow()
            .iter()
            .map(|(_, note)| note.clone())
            .filter(|note| note.owner == owner)
            .collect()
    })
}

#[query]
fn get_principal() -> String {
    return api::caller().to_string();
}

export_candid!();
