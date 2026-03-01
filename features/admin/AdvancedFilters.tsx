import React, { useState } from 'react';
import { Member, AdvancedFilterCriteria, TAMIL_NADU_DISTRICTS, MatchingIndividual } from '../../types';
import { SearchIcon, FilterIcon, UsersIcon } from '../../components/Icons';
import { flattenToMatchingIndividuals } from '../../utils/filterUtils';

interface AdvancedFiltersProps {
    members: Member[];
    onApplyFilters: (criteria: AdvancedFilterCriteria) => void;
}

const INITIAL_CRITERIA: AdvancedFilterCriteria = {
    membershipNo: '',
    keyword: '',
    areas: [],
    maritalStatus: '',
    gender: '', // Kept in state for compatibility but removed from UI
    ageFrom: '',
    ageTo: '',
    dobStart: '',
    dobEnd: '',
    anniversaryStart: '',
    anniversaryEnd: '',
    includeDNC: false,
    quickFilter: 'none'
};

const DISTRICTS = TAMIL_NADU_DISTRICTS;

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ members, onApplyFilters }) => {
    const [criteria, setCriteria] = useState<AdvancedFilterCriteria>(INITIAL_CRITERIA);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleApply = () => {
        onApplyFilters(criteria);
    };


    const handleReset = () => {
        setCriteria(INITIAL_CRITERIA);
        onApplyFilters(INITIAL_CRITERIA);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                        <FilterIcon size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Advanced Search & Filters</h2>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-brand-600 font-semibold text-sm hover:text-brand-700 hover:underline"
                >
                    {isExpanded ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {isExpanded && (
                <div className="space-y-6 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Member / Head Name, Contact or Address</label>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Enter Keyword..."
                                    value={criteria.keyword}
                                    onChange={(e) => setCriteria({ ...criteria, keyword: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Membership ID</label>
                            <input
                                type="text"
                                placeholder="e.g. GCC-001"
                                value={criteria.membershipNo}
                                onChange={(e) => setCriteria({ ...criteria, membershipNo: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Pre-set Filters</label>
                            <select
                                value={criteria.quickFilter}
                                onChange={(e) => setCriteria({ ...criteria, quickFilter: e.target.value as any })}
                                className="w-full px-4 py-2 bg-brand-50 border border-brand-200 rounded-lg text-sm text-brand-700 font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                            >
                                <option value="none">-- Select Quick Filter --</option>
                                <option value="today_birthday">Today's Birthday</option>
                                <option value="upcoming_birthday">Upcoming Birthdays (7 Days)</option>
                                <option value="today_anniversary">Today's Anniversary</option>
                                <option value="no_phone">No Phone Number</option>
                                <option value="recent">Recently Added (30 Days)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">District</label>
                            <select
                                value={criteria.areas[0] || ''}
                                onChange={(e) => setCriteria({ ...criteria, areas: e.target.value ? [e.target.value] : [] })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
                            >
                                <option value="">All Districts</option>
                                {DISTRICTS.map(district => <option key={district} value={district}>{district}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Marital Status</label>
                            <select
                                value={criteria.maritalStatus}
                                onChange={(e) => setCriteria({ ...criteria, maritalStatus: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Divorced">Divorced</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age Range</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="From"
                                    value={criteria.ageFrom}
                                    onChange={(e) => setCriteria({ ...criteria, ageFrom: e.target.value ? Number(e.target.value) : '' })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 text-slate-900"
                                />
                                <span className="text-slate-400 font-medium">-</span>
                                <input
                                    type="number"
                                    placeholder="To"
                                    value={criteria.ageTo}
                                    onChange={(e) => setCriteria({ ...criteria, ageTo: e.target.value ? Number(e.target.value) : '' })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 text-slate-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth Range</label>
                            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-2">
                                <input
                                    type="date"
                                    value={criteria.dobStart}
                                    onChange={(e) => setCriteria({ ...criteria, dobStart: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-500 text-slate-900"
                                />
                                <span className="text-slate-400 font-medium hidden xl:block">-</span>
                                <input
                                    type="date"
                                    value={criteria.dobEnd}
                                    onChange={(e) => setCriteria({ ...criteria, dobEnd: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-500 text-slate-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Anniversary Range</label>
                            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-2">
                                <input
                                    type="date"
                                    value={criteria.anniversaryStart}
                                    onChange={(e) => setCriteria({ ...criteria, anniversaryStart: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-500 text-slate-900"
                                />
                                <span className="text-slate-400 font-medium hidden xl:block">-</span>
                                <input
                                    type="date"
                                    value={criteria.anniversaryEnd}
                                    onChange={(e) => setCriteria({ ...criteria, anniversaryEnd: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-500 text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-slate-200 mt-6 gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={criteria.includeDNC}
                                    onChange={(e) => setCriteria({ ...criteria, includeDNC: e.target.checked })}
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${criteria.includeDNC ? 'bg-red-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${criteria.includeDNC ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>
                            <div>
                                <span className={`text-sm font-bold ${criteria.includeDNC ? 'text-red-600' : 'text-slate-600'}`}>Include "Do Not Call"</span>
                                <span className="block text-xs text-slate-400 font-medium">(Default is Excluded)</span>
                            </div>
                        </label>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <button
                                onClick={handleReset}
                                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-slate-800 transition-colors"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <FilterIcon size={16} />
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

