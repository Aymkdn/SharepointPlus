rmdir /s /q docs
rmdir /s /q node_modules
npm install jsdoc && node "node_modules\jsdoc\jsdoc.js" sharepointplus-4.0.js -t jsdoc_template/ -d docs