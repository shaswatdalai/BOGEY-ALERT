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
        <div className="space-y-5 p-6 animate-fade-in">
            <h2 className="text-3xl font-normal tracking-wide text-white serif-font drop-shadow-md">📋 Exception <span className="text-luxury-blue italic font-light drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">Management</span></h2>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Create Exception Form */}
                <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Create Temporary Override</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Employee ID</label>
                            <select
                                className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] p-2.5 text-sm font-medium text-white outline-none transition focus:border-luxury-blue focus:ring-2 focus:ring-luxury-blue/20"
                                value={newException.employee_id}
                                onChange={(e) => setNewException({ ...newException, employee_id: e.target.value })}
                            >
                                <option value="" className="bg-[#0a0a0f]">Select Employee</option>
                                <option value="FRIEND_001" className="bg-[#0a0a0f]">FRIEND_001 - Engineer</option>
                                <option value="EMP_000" className="bg-[#0a0a0f]">EMP_000 - Engineer</option>
                                <option value="EMP_001" className="bg-[#0a0a0f]">EMP_001 - Manager</option>
                                <option value="EMP_002" className="bg-[#0a0a0f]">EMP_002 - Analyst</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Reason</label>
                            <input
                                type="text"
                                placeholder="e.g., Deadline extension, Project launch"
                                className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] p-2.5 text-sm font-medium text-white placeholder-white/30 outline-none transition focus:border-luxury-blue focus:ring-2 focus:ring-luxury-blue/20"
                                value={newException.reason}
                                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Duration (hours)</label>
                            <input
                                type="number"
                                className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] p-2.5 text-sm font-medium text-white outline-none transition focus:border-luxury-blue focus:ring-2 focus:ring-luxury-blue/20"
                                value={newException.duration_hours}
                                onChange={(e) => setNewException({ ...newException, duration_hours: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Max Files Allowed</label>
                            <input
                                type="number"
                                className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] p-2.5 text-sm font-medium text-white outline-none transition focus:border-luxury-blue focus:ring-2 focus:ring-luxury-blue/20"
                                value={newException.max_files}
                                onChange={(e) => setNewException({ ...newException, max_files: parseInt(e.target.value) })}
                            />
                        </div>

                        <button
                            onClick={createOverride}
                            className="mt-2 w-full rounded-xl bg-luxury-blue/20 border border-luxury-blue/30 py-3 text-sm font-semibold text-luxury-blue transition hover:bg-luxury-blue/30 hover:shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                        >
                            Create Exception
                        </button>
                    </div>
                </div>

                {/* Active Exceptions List */}
                <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Active Exceptions</h3>

                    {exceptions.length === 0 ? (
                        <p className="text-white/30 text-center py-8 italic">No active exceptions</p>
                    ) : (
                        <div className="space-y-3">
                            {exceptions.map((exc, idx) => (
                                <div key={idx} className="border-l-4 border-luxury-blue bg-luxury-blue/10 p-3 rounded-xl border-y border-r border-y-white/10 border-r-white/10">
                                    <div className="font-semibold text-white">{exc.type === 'project' ? '📁 Project' : '⏰ Override'}</div>
                                    <div className="text-sm text-white/80">Reason: {exc.reason}</div>
                                    <div className="text-xs text-white/40 mt-1">Expires: {new Date(exc.expires).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}