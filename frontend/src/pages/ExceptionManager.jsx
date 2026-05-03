import { useState, useEffect } from 'react';

export default function ExceptionManager() {
    const [exceptions, setExceptions] = useState([]);
    const [newException, setNewException] = useState({
        employee_id: "",
        reason: "",
        duration_hours: 4,
        max_files: 100
    });

    useEffect(() => {
        fetchExceptions();
    }, []);

    const fetchExceptions = async () => {
        try {
            const response = await fetch('http://localhost:9091/exceptions');
            const data = await response.json();
            setExceptions(data.exceptions || []);
        } catch (error) {
            console.error('Error fetching exceptions:', error);
        }
    };

    const createOverride = async () => {
        const override = {
            employee_id: newException.employee_id,
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + newException.duration_hours * 3600000).toISOString(),
            reason: newException.reason,
            max_files_per_day: newException.max_files,
            approved_by: "manager@company.com"
        };

        try {
            await fetch('http://localhost:9091/exceptions/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(override)
            });
            alert('Exception created successfully!');
            fetchExceptions();
            setNewException({ employee_id: "", reason: "", duration_hours: 4, max_files: 100 });
        } catch (error) {
            console.error('Error creating exception:', error);
            alert('Failed to create exception');
        }
    };

    return (
        <div className="space-y-5 p-6">
            <h2 className="text-2xl font-bold">📋 Exception Management</h2>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Create Exception Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-lg font-semibold mb-4">Create Temporary Override</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Employee ID</label>
                            <select
                                className="w-full rounded-lg border border-slate-300 p-2"
                                value={newException.employee_id}
                                onChange={(e) => setNewException({ ...newException, employee_id: e.target.value })}
                            >
                                <option value="">Select Employee</option>
                                <option value="FRIEND_001">FRIEND_001 - Engineer</option>
                                <option value="EMP_000">EMP_000 - Engineer</option>
                                <option value="EMP_001">EMP_001 - Manager</option>
                                <option value="EMP_002">EMP_002 - Analyst</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Reason</label>
                            <input
                                type="text"
                                placeholder="e.g., Deadline extension, Project launch"
                                className="w-full rounded-lg border border-slate-300 p-2"
                                value={newException.reason}
                                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-slate-300 p-2"
                                value={newException.duration_hours}
                                onChange={(e) => setNewException({ ...newException, duration_hours: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Max Files Allowed</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border border-slate-300 p-2"
                                value={newException.max_files}
                                onChange={(e) => setNewException({ ...newException, max_files: parseInt(e.target.value) })}
                            />
                        </div>

                        <button
                            onClick={createOverride}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Create Exception
                        </button>
                    </div>
                </div>

                {/* Active Exceptions List */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-lg font-semibold mb-4">Active Exceptions</h3>

                    {exceptions.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No active exceptions</p>
                    ) : (
                        <div className="space-y-3">
                            {exceptions.map((exc, idx) => (
                                <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
                                    <div className="font-semibold">{exc.type === 'project' ? '📁 Project' : '⏰ Override'}</div>
                                    <div className="text-sm">Reason: {exc.reason}</div>
                                    <div className="text-xs text-slate-500">Expires: {new Date(exc.expires).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}