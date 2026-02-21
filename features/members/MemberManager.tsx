import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UserPlusIcon, TrashIcon, SearchIcon, UsersIcon } from '../../components/Icons';

// Mock Data Type
interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

const MemberManager: React.FC = () => {
  // State to hold list of members (Todo List style)
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Member', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Worship Leader', status: 'Active' },
    { id: 3, name: 'Robert Johnson', email: 'bob@example.com', role: 'Elder', status: 'Inactive' },
  ]);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Member');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newMember: Member = {
      id: Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'Active'
    };

    setMembers([newMember, ...members]);
    
    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewRole('Member');
  };

  const handleDelete = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Member Directory</h2>
           <p className="text-slate-500 text-sm mt-1">Manage your church members list (Demo Mode)</p>
        </div>
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <UsersIcon className="text-brand-600" size={20} />
            <span className="font-bold text-slate-700 px-1">{members.length} Members</span>
        </div>
      </div>

      {/* Add Member Form - Top Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Add New Member</h3>
        <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4 items-end">
          <Input 
            label="Full Name" 
            placeholder="e.g. David King" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
            id="name-input"
          />
          <Input 
            label="Email Address" 
            placeholder="e.g. david@mail.com" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1"
            id="email-input"
          />
          <div className="flex flex-col gap-1.5 w-full md:w-48">
            <label className="text-sm font-semibold tracking-wide text-slate-700">Role</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-slate-900"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option>Member</option>
              <option>Volunteer</option>
              <option>Elder</option>
              <option>Worship Team</option>
            </select>
          </div>
          <div className="w-full md:w-auto pt-1">
             <Button type="submit" className="h-12 w-full md:w-auto px-6">
                <UserPlusIcon size={18} className="mr-2" />
                Add
             </Button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        {member.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">{member.email}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        member.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Member"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <SearchIcon size={32} className="opacity-20" />
                       <p>No members found. Add one above!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberManager;