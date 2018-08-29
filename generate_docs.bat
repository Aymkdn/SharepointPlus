rmdir /s /q docs
node "node_modules\jsdoc\jsdoc.js" sharepointplus-5.1.js .\plugins\formfields\sp-plugin.formfields.js -t jsdoc_template/ -d docs
