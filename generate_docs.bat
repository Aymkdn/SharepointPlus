rmdir /s /q docs
node "node_modules\jsdoc\jsdoc.js" sharepointplus-5.2.js .\plugins\formfields\sp-plugin.formfields.js -t jsdoc_template/ -d docs
