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
    }
  }
}
