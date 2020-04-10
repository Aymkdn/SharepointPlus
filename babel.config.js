module.exports = {
  "env": {
    "es": {
      "presets": [
        [
          "@babel/preset-env",
          {
            "modules":false
          }
        ]
      ],
      "plugins": [
        [ "@babel/plugin-transform-runtime", {
          corejs:3,
          useESModules:true
        } ]
      ]
    },
    "dist": {
      "presets": [
        [
          "@babel/preset-env"
        ]
      ],
      "plugins": [
        [ "@babel/plugin-transform-runtime", {
          corejs:3,
          useESModules:false
        } ],
        "add-module-exports"
      ]
    }
  }
}
