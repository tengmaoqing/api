var express = require('express');
var router = express.Router();

const editpage = require('../controllers/editpage.js');
const template = require('../controllers/templates.js');
const page = require('../controllers/pages.js');
const component = require('../controllers/components.js');

/* GET home page. */
router.get('/h5', editpage.h5Base);

// router.post('/generateTpl', editpage.generateTpl);

router.post('/packagePage', editpage.packagePage);

// router.post('/page', editpage.updatePage);
router.post('/getComponents', editpage.getComponents);
router.post('/getDirectives', editpage.getDirectives);

router.get('/template', template.getTemplates);
router.post('/template', template.addTemplate);
router.put('/template', template.updateTemplate);
router.delete('/template', template.deleteTemplate);

router.get('/page', page.getPages);
router.post('/page', page.addPage);
router.put('/page', page.updatePage);
router.delete('/page', page.deletePage);

router.get('/component', component.getComponents);
router.post('/component', component.addComponent);
router.put('/component', component.updateComponent);
router.delete('/component', component.deleteComponent);

module.exports = router;
