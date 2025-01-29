import React, { useEffect, useState } from 'react'
import { note_sharing_backend } from '../../../declarations/note_sharing_backend';
import toast from "react-hot-toast";

function Home() {
    const [Notes, setNotes] = useState([]);
    const [inputContent, setInputContent] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [updatingNote, setUpdatingNote] = useState([]);
    const [shareWith, setShareWith] = useState("");
    const [principal, setPrincipal] = useState("");

    const fetchnotes = async () => {
        const updatedNotes = await note_sharing_backend.get_notes();
        setNotes(updatedNotes);
    }
    const fetchprincipal = async () => {
        const principal = await note_sharing_backend.get_principal();
        setPrincipal(principal);
    }
    const handelSubmit = async (e) => {
        if (!inputContent.trim()) {
            toast.error("data can not be empty.");
            return;
        };
        e.preventDefault();
        const save_result = await note_sharing_backend.add_note(inputContent);
        fetchnotes();
        setInputContent("");
        toast.success("Saved successfully", {
            style: {
                minWidth: '250px',
                fontSize: 'smaller'
            },
        });
    }
    const handleDelete = async (id) => {
        const delete_result = await note_sharing_backend.delete_note(id);
        console.log(delete_result);
        fetchnotes();
        toast.success("Deleted", {
            style: {
                minWidth: '250px',
                fontSize: 'smaller'
            },
        });
    }
    const handelUpdate = async (e) => {
        if (!inputContent.trim()) {
            toast.error("data can not be empty.");
            return;
        };
        e.preventDefault();
        const update_result = await note_sharing_backend.update_note(updatingNote.id, inputContent);
        console.log(update_result);

        if (update_result.Ok) {
            toast.success("updated successfully", {
                style: {
                    minWidth: '250px',
                    fontSize: 'smaller'
                },
            });
        } else {
            toast.error(update_result.Err);
        }
        setIsUpdating(false);
        setInputContent("");
        fetchnotes();
    };
    const loadUpdateData = async (id) => {
        const note = await note_sharing_backend.get_note_by_id(id);
        setIsUpdating(true);
        setUpdatingNote(note[0]);
    }
    const cancelUpdate = () => {
        setInputContent("");
        setUpdatingNote([]);
        setIsUpdating(false);
    }
    const handleShare = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const noteId = parseInt(formData.get("noteid"), 10);
        const share_result = await note_sharing_backend.share_note(noteId, shareWith);
        if (share_result.Ok) {
            toast.success("shared successfully", {
                style: {
                    minWidth: '250px',
                    fontSize: 'smaller'
                },
            });
            setShareWith("");
        } else {
            toast.success(share_result.Err, {
                style: {
                    minWidth: '250px',
                    fontSize: 'smaller'
                },
            });
        }

    }

    useEffect(() => {
        if (isUpdating) {
            // console.log("changing : ",updatingNote.content);
            setInputContent(updatingNote.content);
        }
    }, [updatingNote]);

    useEffect(() => {
        fetchnotes();
        fetchprincipal();
    }, [])
    return (
        <div className="home flex flex-col items-center gap-4" >
            <div className="card-box card bg-base-100 w-96 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Enter Note</h2>
                    <textarea className="textarea textarea-accent" placeholder="Type here"
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                    ></textarea>
                    <div className="card-actions justify-end">
                        {isUpdating ?
                            (<div className="card-actions justify-end">
                                <button className="btn btn-active btn-error" onClick={cancelUpdate}>Cancel</button>
                                <button className="btn btn-active  btn-info" onClick={handelUpdate}>Update</button>
                            </div>
                            ) : (
                                <button className="btn btn-active btn-accent" onClick={handelSubmit}>Save</button>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className='container mx-auto w-100 h-100  px-10'>
                <h1 className='bg-gray-500 px-5 text-white rounded'>Your Notes</h1>
                <div class="grid grid-cols-3 gap-5 p-10 " >
                    {Notes.map((note) => (
                        <div key={note.id} className="card bg-base-100 w-96 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">{note.id}</h2>
                                <p>{note.content}</p>
                                {principal == note.owner ?
                                    <div className="card-actions justify-end">

                                        <button className="btn btn-success btn-sm" onClick={() => document.getElementById(`my_modal_${note.id}`).showModal()}>Share With</button>
                                        <button className="btn btn-error btn-sm" onClick={() => handleDelete(note.id)}>Delete</button>
                                        <button className='btn btn-sm btn-info' onClick={() => loadUpdateData(note.id)}>Update</button>
                                    </div>
                                    :
                                    <button className='btn btn-sm btn-primary btn-disabled'>Shared with you</button>
                                }
                            </div>
                            <dialog id={`my_modal_${note.id}`} className="modal">
                                <div className="modal-box">
                                    <form method="dialog">
                                        {/* if there is a button in form, it will close the modal */}
                                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={(e) => { setShareWith("") }}>✕</button>
                                    </form>
                                    <h3 className="font-bold text-lg">{note.id}</h3>
                                    <p className="py-4">{note.content}</p>
                                    <div className="modal-action">
                                        <form onSubmit={handleShare}>
                                            <input type="text" hidden name='noteid' value={note.id} readOnly />
                                            <div className='flex justify-between'>
                                                <label htmlFor="" className='mr-2 text-sm'>Sharing with </label>
                                                <input
                                                    value={shareWith}
                                                    onChange={(e) => { setShareWith(e.target.value) }}
                                                    type="text"
                                                    placeholder="Type priciple id"
                                                    className="input input-bordered input-primary w-full max-w-xs" />
                                                <button className="btn mx-2 btn-success">share</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    )
}

export default Home;
