import React, { useState, useEffect, useCallback } from 'react';
import { fetchProblems, createProblem, deleteProblem, updateProblem } from '../context/problemfetch';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Plus, Trash2, Edit, X } from 'lucide-react';

const FormInput = (props) => (
    <input {...props} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition text-slate-200" />
);

const FormTextarea = (props) => (
    <textarea {...props} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition text-slate-200 font-mono" />
);

const FormSelect = (props) => (
    <select {...props} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition text-slate-200" />
);
const EditProblemModal = ({ problem, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...problem, testCases: problem?.testCases || [] });

    useEffect(() => {
        setFormData({ ...problem, testCases: problem?.testCases || [] });
    }, [problem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...formData.testCases];
        newTestCases[index][field] = value;
        setFormData(prev => ({ ...prev, testCases: newTestCases }));
    };

    const handleAddTestCase = () => {
        setFormData(prev => ({ ...prev, testCases: [...prev.testCases, { input: '', output: '' }] }));
    };

    const handleRemoveTestCase = (index) => {
        const newTestCases = formData.testCases.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, testCases: newTestCases }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData._id, formData);
        onClose();
    };

    if (!problem) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-6 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl text-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Problem</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-slate-400 mb-1">Title</label><FormInput type="text" name="title" value={formData.title} onChange={handleChange} required /></div>
                        <div><label className="block text-sm font-medium text-slate-400 mb-1">Description (Markdown)</label><FormTextarea name="description" value={formData.description} onChange={handleChange} rows="6" required /></div>
                        <div><label className="block text-sm font-medium text-slate-400 mb-1">Difficulty</label><FormSelect name="difficulty" value={formData.difficulty} onChange={handleChange}><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></FormSelect></div>
                    </div>

                    <h3 className="text-lg font-semibold mb-3 mt-6 text-white">Test Cases</h3>
                    {formData.testCases.map((testCase, index) => (
                        <div key={index} className="mb-4 p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-white">Test Case {index + 1}</h4>
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTestCase(index)} className="text-red-400 hover:bg-red-500/10 hover:text-red-400">
                                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-400 mb-1">Input</label><FormTextarea value={testCase.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} rows="3" /></div>
                                <div><label className="block text-sm font-medium text-slate-400 mb-1">Output</label><FormTextarea value={testCase.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} rows="3" required /></div>
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddTestCase} className="w-full border-dashed border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200">
                        <Plus className="h-4 w-4 mr-2" /> Add Test Case
                    </Button>

                    <div className="flex justify-end gap-4 mt-8">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-300 hover:bg-slate-700 hover:text-white">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold hover:brightness-110">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ManageProblemsPage = () => {
    const { user } = useAuth();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateFormVisible, setCreateFormVisible] = useState(false);
    const [newProblem, setNewProblem] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        testCases: [{ input: '', output: '' }],
    });
    const [editingProblem, setEditingProblem] = useState(null);

    const loadProblems = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchProblems();
            if (user && user.role === 'setter') {
                setProblems(data.filter(p => p.author?._id === user._id));
            } else {
                setProblems(data);
            }
        } catch (err) {
            setError('Failed to fetch problems.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadProblems();
    }, [loadProblems]); 

    const handleNewProblemChange = (e) => {
        const { name, value } = e.target;
        setNewProblem(prev => ({ ...prev, [name]: value }));
    };

    const handleNewTestCaseChange = (index, field, value) => {
        const testCases = [...newProblem.testCases];
        testCases[index][field] = value;
        setNewProblem(prev => ({ ...prev, testCases }));
    };

    const addNewTestCase = () => {
        setNewProblem(prev => ({ ...prev, testCases: [...prev.testCases, { input: '', output: '' }] }));
    };

    const removeNewTestCase = (index) => {
        const testCases = newProblem.testCases.filter((_, i) => i !== index);
        setNewProblem(prev => ({ ...prev, testCases }));
    };

    const handleCreateProblem = async (e) => {
        e.preventDefault();
        try {
            await createProblem(newProblem);
            setNewProblem({ title: '', description: '', difficulty: 'Easy', testCases: [{ input: '', output: '' }] });
            setCreateFormVisible(false);
            loadProblems(); 
        } catch (err) {
            setError('Failed to create problem.');
        }
    };

    const handleDeleteProblem = async (id) => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                await deleteProblem(id);
                loadProblems(); 
            } catch (err) {
                setError('Failed to delete problem.');
            }
        }
    };

    const handleUpdateProblem = async (id, updatedData) => {
        try {
            await updateProblem(id, updatedData);
            setEditingProblem(null);
            loadProblems();
        } catch (err) {
            setError('Failed to update problem.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0f1e]">
                <div className="h-12 w-12 animate-spin border-4 border-cyan-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 text-red-400 bg-[#0a0f1e] min-h-screen">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-200 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] animate-gradient">
                    Manage Problems
                </h1>
                <Button onClick={() => setCreateFormVisible(!isCreateFormVisible)} className="bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold hover:scale-105 transition hover:shadow-lg hover:shadow-cyan-500/20">
                    {isCreateFormVisible ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Plus className="h-4 w-4 mr-2" />Add Problem</>}
                </Button>
            </div>

            {isCreateFormVisible && (
                <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] p-6 rounded-2xl shadow-2xl mb-8 border border-slate-700 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                    <h2 className="text-2xl font-bold mb-4 text-white">Create New Problem</h2>
                    <form onSubmit={handleCreateProblem}>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-400 mb-1">Title</label><FormInput type="text" name="title" value={newProblem.title} onChange={handleNewProblemChange} required /></div>
                            <div><label className="block text-sm font-medium text-slate-400 mb-1">Description (Markdown)</label><FormTextarea name="description" value={newProblem.description} onChange={handleNewProblemChange} rows="6" required /></div>
                            <div><label className="block text-sm font-medium text-slate-400 mb-1">Difficulty</label><FormSelect name="difficulty" value={newProblem.difficulty} onChange={handleNewProblemChange}><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></FormSelect></div>
                        </div>

                        <h3 className="text-lg font-semibold mb-3 mt-6 text-white">Test Cases</h3>
                        {newProblem.testCases.map((tc, index) => (
                            <div key={index} className="mb-4 p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold text-white">Test Case {index + 1}</h4>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeNewTestCase(index)} className="text-red-400 hover:bg-red-500/10 hover:text-red-400">
                                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-400 mb-1">Input</label><FormTextarea value={tc.input} onChange={(e) => handleNewTestCaseChange(index, 'input', e.target.value)} rows="3" /></div>
                                    <div><label className="block text-sm font-medium text-slate-400 mb-1">Output</label><FormTextarea value={tc.output} onChange={(e) => handleNewTestCaseChange(index, 'output', e.target.value)} rows="3" required /></div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addNewTestCase} className="w-full border-dashed border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200">
                            <Plus className="h-4 w-4 mr-2" /> Add Test Case
                        </Button>

                        <div className="flex justify-end mt-8">
                            <Button type="submit" className="bg-gradient-to-r from-[#00d4ff] to-[#00ffa3] text-black font-bold hover:brightness-110">
                                Create Problem
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto bg-[#10172a] border border-slate-700 rounded-2xl shadow-2xl">
                <table className="min-w-full">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Difficulty</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {problems.map(problem => (
                            <tr key={problem._id} className="hover:bg-slate-800/40 transition-colors duration-200">
                                <td className="py-4 px-6 font-medium text-white">{problem.title}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                        problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {problem.difficulty}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <Button onClick={() => setEditingProblem(problem)} variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 mr-2">
                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button onClick={() => handleDeleteProblem(problem._id)} variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 hover:text-red-400">
                                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingProblem && (
                <EditProblemModal
                    problem={editingProblem}
                    onClose={() => setEditingProblem(null)}
                    onSave={handleUpdateProblem}
                />
            )}
        </div>
        </div>
    );
};

export default ManageProblemsPage;