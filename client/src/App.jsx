/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import axios from 'axios'

const styles = {
    container: { fontFamily: 'Arial, sans-serif', background: '#f4f7f6', minHeight: '100vh', padding: '20px', color: '#333' },
    header: { textAlign: 'center', marginBottom: '30px', color: '#222' },
    btnInit: { background: '#7f8c8d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '10px', borderRadius: '4px' },
    mainLayout: { display: 'flex', gap: '30px', maxWidth: '1200px', margin: '0 auto' },
    cardMP: { background: 'white', borderRadius: '5px', padding: '20px', flex: 1, borderTop: '5px solid #3498db', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    cardTST: { background: 'white', borderRadius: '5px', padding: '20px', flex: 1, borderTop: '5px solid #e74c3c', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    title: { borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#2c3e50' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', background: '#fff', color: '#000' },
    btnPrimary: { width: '100%', padding: '10px', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' },
    btnDanger: { width: '100%', padding: '10px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' },
    btnSuccess: { background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginLeft: '10px', borderRadius: '4px' },
    projectItem: (isActive) => ({
        padding: '12px', margin: '8px 0', cursor: 'pointer', borderRadius: '4px',
        background: isActive ? '#e8f6f3' : '#fff', border: isActive ? '2px solid #1abc9c' : '1px solid #eee', color: '#000'
    }),
    bugItem: (status) => ({
        background: status === 'SOLVED' ? '#f0fff4' : '#fff',
        borderLeft: status === 'SOLVED' ? '5px solid #27ae60' : '5px solid #e74c3c',
        padding: '15px', margin: '10px 0', border: '1px solid #eee', borderRadius: '4px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#000'
    }),
    label: { fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#555', fontSize: '12px' }
};

function App() {
    // aici tin datele din baza de date
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [bugs, setBugs] = useState([]);

    // variabile pentru formulare
    const [newProjName, setNewProjName] = useState("");
    const [newProjRepo, setNewProjRepo] = useState("");

    const [bugDesc, setBugDesc] = useState("");
    const [bugSever, setBugSever] = useState("Low");
    const [bugCommit, setBugCommit] = useState("");

    // incarc proiectele cand porneste pagina
    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/projects');
            setProjects(res.data);
        } catch (err) { console.error(err); }
    }

    // functia pentru mp sa adauge proiect
    const handleAddProject = async () => {
        if (!newProjName) return alert("Scrie un nume!");
        await axios.post('http://localhost:8080/api/projects', { name: newProjName, repoUrl: newProjRepo });
        fetchProjects();
        setNewProjName(""); setNewProjRepo("");
        alert("Proiect creat!");
    }

    const handleSelectProject = async (proj) => {
        setSelectedProject(proj);
        refreshBugs(proj.id);
    }

    // reincarc lista de buguri de la server
    const refreshBugs = async (pid) => {
        const res = await axios.get(`http://localhost:8080/api/projects/${pid}/bugs`);
        setBugs(res.data);
    }

    // functia pentru tester sa adauge bug
    const handleAddBug = async () => {
        if (!selectedProject) return;
        if (!bugDesc) return alert("Scrie o descriere!");

        await axios.post(`http://localhost:8080/api/projects/${selectedProject.id}/bugs`, {
            description: bugDesc,
            severity: bugSever,
            priority: "High",
            commitLink: bugCommit
        });

        setBugDesc(""); setBugCommit("");
        refreshBugs(selectedProject.id);
        alert("Bug raportat!");
    }

    // functia pentru mp sa rezolve bugul
    const handleResolveBug = async (bugId) => {
        await axios.put(`http://localhost:8080/api/bugs/${bugId}`);
        refreshBugs(selectedProject.id);
    }

    const initDb = async () => {
        await axios.get('http://localhost:8080/sync');
        alert("Baza de date a fost resetata!");
        setProjects([]); setSelectedProject(null);
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>
                BugBuster <span style={{ fontSize: '12px', color: '#777' }}>(Student: Vasilache Maria-Catalina)</span>
                <button onClick={initDb} style={{ ...styles.btnInit, marginLeft: '15px' }}>RESET DB</button>
            </h1>

            <div style={styles.mainLayout}>

                {/* coloana stanga pentru membru proiect */}
                <div style={styles.cardMP}>
                    <h2 style={styles.title}>Membru Proiect (MP)</h2>
                    <div style={{ background: '#f9f9f9', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
                        <label style={styles.label}>NUME PROIECT:</label>
                        <input style={styles.input} placeholder="Ex: E-Commerce App" value={newProjName} onChange={e => setNewProjName(e.target.value)} />

                        <label style={styles.label}>REPOSITORY URL:</label>
                        <input style={styles.input} placeholder="Ex: github.com/user/repo" value={newProjRepo} onChange={e => setNewProjRepo(e.target.value)} />

                        <button style={styles.btnPrimary} onClick={handleAddProject}>+ Inregistreaza Proiect</button>
                    </div>

                    <div>
                        <h4 style={{ color: '#3498db' }}>Proiectele Mele:</h4>
                        {projects.map(p => (
                            <div key={p.id} onClick={() => handleSelectProject(p)} style={styles.projectItem(selectedProject?.id === p.id)}>
                                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                <div style={{ fontSize: '11px', color: '#666' }}>Repo: {p.repoUrl}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* coloana dreapta pentru tester */}
                <div style={styles.cardTST}>
                    <h2 style={styles.title}>Tester (TST)</h2>

                    {!selectedProject ? <p>Selecteaza un proiect din stanga pentru a incepe.</p> : (
                        <>
                            <div style={{ background: '#fff0f0', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#c0392b' }}>Raporteaza Bug Nou</h4>

                                <label style={styles.label}>DESCRIERE:</label>
                                <input style={styles.input} placeholder="Ex: Butonul de login da eroare" value={bugDesc} onChange={e => setBugDesc(e.target.value)} />

                                <label style={styles.label}>LINK COMMIT (Unde a aparut eroarea):</label>
                                <input style={styles.input} placeholder="Ex: github.com/.../commit/a1b2c3" value={bugCommit} onChange={e => setBugCommit(e.target.value)} />

                                <label style={styles.label}>SEVERITATE:</label>
                                <select onChange={e => setBugSever(e.target.value)} style={{ ...styles.input, marginBottom: '15px' }}>
                                    <option value="Low">Mica (Low)</option>
                                    <option value="High">Mare (High)</option>
                                    <option value="Critical">Critica</option>
                                </select>

                                <button style={styles.btnDanger} onClick={handleAddBug}>Raporteaza Bug</button>
                            </div>

                            <div>
                                <h4>Lista Bug-uri:</h4>
                                {bugs.map(b => (
                                    <div key={b.id} style={styles.bugItem(b.status)}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                                [{b.severity}] {b.description}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#555' }}>Commit: {b.commitLink || "N/A"}</div>
                                            {b.status === 'SOLVED' && <div style={{ color: 'green', fontWeight: 'bold', fontSize: '12px' }}>REZOLVAT</div>}
                                        </div>

                                        {b.status !== 'SOLVED' && (
                                            <button style={styles.btnSuccess} onClick={() => handleResolveBug(b.id)}>Rezolva (MP)</button>
                                        )}
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