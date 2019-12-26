rmdir /s /q docs
node "node_modules\jsdoc\jsdoc.js" .\src\ -t jsdoc_template/ -d docs
