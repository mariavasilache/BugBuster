const express = require('express');
const Sequelize = require('sequelize');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'bugbuster.sqlite'
});

const Project = sequelize.define('project', {
    name: Sequelize.STRING,
    repoUrl: Sequelize.STRING,
    team: Sequelize.STRING
});

const Bug = sequelize.define('bug', {
    description: Sequelize.STRING,
    severity: Sequelize.STRING,
    priority: Sequelize.STRING,
    priority: Sequelize.STRING,
    commitLink: Sequelize.STRING,
    status: { type: Sequelize.STRING, defaultValue: 'OPEN' }
});

Project.hasMany(Bug);
Bug.belongsTo(Project);

app.get('/sync', async (req, res) => {
    try {
        await sequelize.sync({ force: true });
        res.status(201).json({ message: 'DB Created' });
    } catch (e) { res.status(500).json({ error: e.message }) }
});

app.get('/api/projects', async (req, res) => {
    const projects = await Project.findAll();
    res.status(200).json(projects);
});

app.post('/api/projects', async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json(project);
    } catch (e) { res.status(500).json({ error: e.message }) }
});

app.get('/api/projects/:pid/bugs', async (req, res) => {
    const bugs = await Bug.findAll({ where: { projectId: req.params.pid } });
    res.status(200).json(bugs);
});

app.post('/api/projects/:pid/bugs', async (req, res) => {
    try {
        const bug = await Bug.create(req.body);
        bug.projectId = req.params.pid;
        await bug.save();
        res.status(201).json(bug);
    } catch (e) { res.status(500).json({ error: e.message }) }
});

app.put('/api/bugs/:bugId', async (req, res) => {
console.log("AM PRIMIT CERERE DE REZOLVARE PENTRU BUG: " + req.params.bugId);
    try {
        const bug = await Bug.findByPk(req.params.bugId);
        if (bug) {
            bug.status = "SOLVED";
            await bug.save();
            res.json(bug);
        } else {
            res.status(404).json({ message: 'Bug not found' });
        }
    } catch (e) { res.status(500).json({ error: e.message }) }
});

app.delete('/api/bugs/:id', async (req, res) => {
    try {
        await Bug.destroy({ where: { id: req.params.id } });
        res.status(200).send("Sters");
    } catch (err) { res.status(500).send(err); }
});

app.listen(8080, () => console.log('Server running on port 8080'));