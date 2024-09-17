var A = ["H", "Li", "Na", "K"]
var B = ["F", "Cl", "Br", "I"]
var C = ["O", "S", "Se"]

var elementsArray = [];

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    var compounds = await this.getCompounds();

    this.el.addEventListener("markerFound", () => {
      var elementName = this.el.getAttribute("element_name")
      var barcodeValue = this.el.getAttribute("value")
      elementsArray.push({element_name: elementName, barcode_value: barcodeValue})
      
      //Cambiar la visibilidad del compuesto
      compounds[barcodeValue]["compounds"].map(item =>{
        var compound = document.querySelector(`#${item.compound_name}-${barcodeValue}`)
        compound.setAttribute("visible", false)
      })

      //cambiar la visibilidad del atomo
      var atom = document.querySelector(`#${elementName}-${barcodeValue}`)
      atom.setAttribute("visible", true)
    });

    this.el.addEventListener("markerLost", () => {
      var elementName = this.el.getAttribute("element_name")
      var index = elementsArray.findIndex(x => x.element_name === elementName)
      if(index > -1){
        elementsArray.splice(index, 1)
      }
    });
  },


  tick: function () {
    if(elementsArray.length > 1){
      var messageText = document.querySelector("#message-text")
      var length = elementsArray.length
      var distance = null
      var compound = this.getCompound()

      if(length === 2){
        var marker1 = document.querySelector(`#marker-${elementsArray[0].barcode_value}`)
        var marker2 = document.querySelector(`#marker-${elementsArray[1].barcode_value}`)

        distance = this.getDistance(marker1, marker2)
        console.log(distance)
        if(distance < 1.25){
          if(compound !== undefined){
            this.showCompound(compound)
          }else{
            messageText.setAttribute("visible", true)
          }
        }else{
          messageText.setAttribute("visible", false)
        }
      }
    }
  },
  // Calcular la distancia entre la posición de dos marcadores
  getDistance: function (elA, elB) {
      return elA.object3D.position.distanceTo(elB.object3D.position)
  },  
  getCompound: function () {
    for(var al of elementsArray){
      if(A.includes(al.element_name)){
        var compound = al.element_name
        for(var el of elementsArray){
          if(B.includes(el.element_name)){
            compound += el.element_name
            return {name: compound, value: el.barcode_value}
          }
          
        }
      }
    }
  },
  showCompound: function (compound) {
    // Ocultar elementos
    elementsArray.map(item => {
      var el = document.querySelector(`#${item.element_name}-${item.barcode_value}`);
      el.setAttribute("visible", false);
    });
    // Mostrar compuesto
    var compounds = document.querySelector(`#${compound.name}-${compound.value}`);
    compounds.setAttribute("visible", true);
  },
  getCompounds: function () {
    // Nota: utiliza el servidor de ngrok para obtener los valores JSON
    return fetch("js/compoundList.json")
      .then(res => res.json())
      .then(data => data);
  },
});
