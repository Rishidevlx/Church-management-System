import React, { useState } from 'react';
import { MessageSquareIcon, CrossIcon, FileTextIcon, TrashIcon } from '../../components/Icons';
import { Member } from '../../types';

interface NotesModalProps {
    member: Member;
    onClose: () => void;
    onUpdate: (m: Member) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ member, onClose, onUpdate }) => {
    const [newNote, setNewNote] = useState('');

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        const note = {
            id: Date.now().toString(),
            text: newNote.trim(),
            date: new Date().toLocaleString()
        };

        const updatedMember = {
            ...member,
            notes: [note, ...(member.notes || [])]
        };

        onUpdate(updatedMember);
        setNewNote('');
    };

    const handleDeleteNote = (noteId: string) => {
        const updatedMember = {
            ...member,
            notes: (member.notes || []).filter(n => n.id !== noteId)
        };
        onUpdate(updatedMember);
    };

    const handleClearAllNotes = () => {
        if (!confirm('Are you sure you want to clear all notes for this member?')) return;
        const updatedMember = {
            ...member,
            notes: []
        };
        onUpdate(updatedMember);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fadeIn text-slate-900 flex flex-col">
                <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600 border border-blue-100">
                            <MessageSquareIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Notes</h2>
                            <p className="text-slate-500 text-sm font-medium">Notes for {member.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200 group">
                        <CrossIcon size={24} className="text-slate-500 group-hover:text-red-600" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
                    {/* Add Note Input Area */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-8">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Add New Note</h3>
                        <div className="flex flex-col gap-3">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Type your note here..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-700 text-sm resize-none"
                                rows={3}
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center gap-2"
                                >
                                    <MessageSquareIcon size={16} /> Save Note
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Previous Notes Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                <FileTextIcon size={18} className="text-slate-400" />
                                Previous Notes
                            </h3>
                            {member.notes && member.notes.length > 0 && (
                                <button
                                    onClick={handleClearAllNotes}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-colors flex items-center gap-1"
                                >
                                    <TrashIcon size={14} /> Clear All
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                                    <tr>
                                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider w-48">Date & Time</th>
                                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Note Content</th>
                                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {member.notes && member.notes.length > 0 ? (
                                        member.notes.map((note) => (
                                            <tr key={note.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="py-4 px-6 text-slate-500 whitespace-nowrap text-xs font-semibold">{note.date}</td>
                                                <td className="py-4 px-6 text-slate-800 leading-relaxed font-medium">{note.text}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Delete Note"
                                                    >
                                                        <TrashIcon size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="p-3 bg-slate-50 rounded-full mb-3">
                                                        <MessageSquareIcon size={24} className="text-slate-300" />
                                                    </div>
                                                    <p className="italic">No notes recorded yet</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
