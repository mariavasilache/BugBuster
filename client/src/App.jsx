/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import axios from 'axios'

const priorityOrder = { 'High': 2, 'Low': 1 };

const styles = {
    container: { fontFamily: 'Arial, sans-serif', background: '#f0f2f5', minHeight: '100vh', width: '100%', padding: '20px', color: '#333', boxSizing: 'border-box', position: 'absolute', top: 0, left: 0 },
    loginBox: { maxWidth: '400px', margin: '100px auto', background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' },
    navBar: { background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    roleBadge: { padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', color: 'white' },
    mainLayout: { display: 'flex', gap: '20px' },
    card: { background: 'white', borderRadius: '8px', padding: '20px', flex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
    btnMP: { width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' },
    btnTST: { width: '100%', padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    btnSuccess: { background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' },
    btnDelete: { background: '#95a5a6', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px', marginLeft: '10px' },
    projectItem: (selected) => ({ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', background: selected ? '#e8f6f3' : 'transparent' }),
    bugItem: (status, severity) => {
        let borderColor = '#e74c3c';
        let bgColor = '#fff5f5';
        let opacity = 1;
        if (status === 'SOLVED') {
            borderColor = '#bdc3c7';
            bgColor = '#f8f9fa';
            opacity = 0.6;
        } else if (severity === 'Low') {
            borderColor = '#f39c12';
            bgColor = '#fef5e7';
        }
        return { background: bgColor, borderLeft: `6px solid ${borderColor}`, padding: '15px', margin: '10px 0', borderRadius: '4px', opacity: opacity, boxShadow: status === 'SOLVED' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)' };
    }
};

function App() {
    const [userRole, setUserRole] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [bugs, setBugs] = useState([]);
    const [newProjName, setNewProjName] = useState("");
    const [newProjRepo, setNewProjRepo] = useState("");
    const [newProjTeam, setNewProjTeam] = useState("");
    const [bugDesc, setBugDesc] = useState("");
    const [bugSever, setBugSever] = useState("Low");
    const [bugPrio, setBugPrio] = useState("Low");
    const [bugCommit, setBugCommit] = useState("");

    useEffect(() => { if (userRole) fetchProjects(); }, [userRole]);

    const fetchProjects = async () => {
        try { const res = await axios.get('http://localhost:8080/api/projects'); setProjects(res.data); }
        catch (err) { console.error(err); }
    }

    const handleAddProject = async () => {
        if (!newProjName) return alert("Completeaza numele!");
        await axios.post('http://localhost:8080/api/projects', { name: newProjName, repoUrl: newProjRepo, team: newProjTeam });
        fetchProjects(); setNewProjName(""); setNewProjRepo(""); setNewProjTeam("");
    }

    const handleSelectProject = async (proj) => { setSelectedProject(proj); refreshBugs(proj.id); }

    const refreshBugs = async (pid) => {
        const res = await axios.get(`http://localhost:8080/api/projects/${pid}/bugs`);
        setBugs(res.data);
    }

    const handleAddBug = async () => {
        if (!selectedProject) return;
        await axios.post(`http://localhost:8080/api/projects/${selectedProject.id}/bugs`, { description: bugDesc, severity: bugSever, priority: bugPrio, commitLink: bugCommit });
        setBugDesc(""); setBugCommit(""); refreshBugs(selectedProject.id);
    }

    const handleResolveBug = async (bugId) => {
        await axios.put(`http://localhost:8080/api/bugs/${bugId}`);
        refreshBugs(selectedProject.id);
    }

    const handleDeleteBug = async (bugId) => {
        if (!window.confirm("Stergi acest bug?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/bugs/${bugId}`);
            refreshBugs(selectedProject.id);
        } catch (err) { alert("Eroare la stergere!"); }
    }

    const initDb = async () => { await axios.get('http://localhost:8080/sync'); window.location.reload(); }

    if (!userRole) {
        return (
            <div style={styles.container}>
                <button onClick={initDb} style={{ position: 'absolute', top: 10, right: 10 }}>RESET DB</button>
                <div style={styles.loginBox}>
                    <h1>BugBuster Login</h1>
                    <button style={styles.btnMP} onClick={() => setUserRole('MP')}>Intra ca Membru Proiect (MP)</button>
                    <button style={styles.btnTST} onClick={() => setUserRole('TST')}>Intra ca Tester (TST)</button>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.navBar}>
                <h3>BugBuster Dashboard</h3>
                <div>
                    Autentificat ca: <span style={{ ...styles.roleBadge, background: userRole === 'MP' ? '#3498db' : '#e74c3c', marginLeft: '10px' }}>{userRole}</span>
                    <button onClick={() => setUserRole(null)} style={{ marginLeft: '20px' }}>Logout</button>
                </div>
            </div>

            <div style={styles.mainLayout}>
                <div style={{ ...styles.card, flex: 1 }}>
                    <h4>Proiecte</h4>
                    {userRole === 'MP' && (
                        <div style={{ background: '#f9f9f9', padding: '10px', marginBottom: '15px' }}>
                            <input style={styles.input} placeholder="Nume Proiect" value={newProjName} onChange={e => setNewProjName(e.target.value)} />
                            <input style={styles.input} placeholder="Echipa" value={newProjTeam} onChange={e => setNewProjTeam(e.target.value)} />
                            <button style={styles.btnMP} onClick={handleAddProject}>+ Proiect Nou</button>
                        </div>
                    )}
                    {projects.map(p => (
                        <div key={p.id} onClick={() => handleSelectProject(p)} style={styles.projectItem(selectedProject?.id === p.id)}>
                            <b>{p.name}</b>
                        </div>
                    ))}
                </div>

                <div style={{ ...styles.card, flex: 2 }}>
                    <h4>{selectedProject ? `Bug-uri: ${selectedProject.name}` : "Selecteaza un proiect"}</h4>
                    {selectedProject && (
                        <>
                            {userRole === 'TST' && (
                                <div style={{ background: '#fff5f5', padding: '15px', marginBottom: '20px', border: '1px solid #e74c3c' }}>
                                    <input style={styles.input} placeholder="Descriere" value={bugDesc} onChange={e => setBugDesc(e.target.value)} />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select style={styles.input} value={bugSever} onChange={e => setBugSever(e.target.value)}>
                                            <option value="Low">Severitate: Low</option>
                                            <option value="Critical">Severitate: Critical</option>
                                        </select>
                                        <select style={styles.input} value={bugPrio} onChange={e => setBugPrio(e.target.value)}>
                                            <option value="Low">Prioritate: Low</option>
                                            <option value="High">Prioritate: High</option>
                                        </select>
                                    </div>
                                    <button style={styles.btnTST} onClick={handleAddBug}>Raporteaza Bug</button>
                                </div>
                            )}

                            <div>
                                {[...bugs].sort((a, b) => {
                                    if (a.status === 'SOLVED' && b.status !== 'SOLVED') return 1;
                                    if (a.status !== 'SOLVED' && b.status === 'SOLVED') return -1;
                                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                                }).map(b => (
                                    <div key={b.id} style={styles.bugItem(b.status, b.severity)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <b style={{ textDecoration: b.status === 'SOLVED' ? 'line-through' : 'none' }}>{b.description}</b>
                                            <span style={{ fontWeight: 'bold', color: b.status === 'SOLVED' ? '#95a5a6' : (b.priority === 'High' ? 'red' : '#f39c12') }}>Prio: {b.priority}</span>
                                        </div>
                                        <div style={{ fontSize: '12px' }}>Sev: {b.severity} | Stat: {b.status}</div>
                                        <div style={{ marginTop: '10px' }}>
                                            {b.status !== 'SOLVED' && userRole === 'MP' && (
                                                <button style={styles.btnSuccess} onClick={() => handleResolveBug(b.id)}>Rezolva</button>
                                            )}
                                            {userRole === 'TST' && (
                                                <button style={styles.btnDelete} onClick={() => handleDeleteBug(b.id)}>Sterge</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App