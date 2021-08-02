class ElementReactive {
    // Dependencias
    deps = new Map();

    constructor(options) {
        this.origen = options.data();
        
        const self = this;

        // Destino
        this.$data = new Proxy(this.origen, {
            get(target, name){
                if (Reflect.has(target, name)){
                    self.track(target, name);
                    return Reflect.get(target, name);
                } 
                console.warn("La propiedad ", name, " no existe.");
                return ""
            },
            set(target, name, value){
                Reflect.set(target, name, value)
				self.trigger(name);
			}

        });
    }
    
    track(target, name){
		if(!this.deps.has(name)){
			const effect = ()=>{
				document.querySelectorAll(`*[s-text=${name}]`).forEach(element=>{
					this.sText(element, target, name);
				});
			};
			this.deps.set(name, effect);
		}
	}

    trigger(name){
		const effect = this.deps.get(name);
		effect();
	}

    mount(){
        document.querySelectorAll("*[s-text]").forEach(element =>{
            this.sText(element, this.$data, element.getAttribute("s-text"))
        })

        document.querySelectorAll("*[s-model]").forEach(element=>{
            const name = element.getAttribute("s-model");
            this.sModel(element, this.$data, name)
            
            element.addEventListener("input", ()=>{
                Reflect.set(this.$data, name, element.value);
            })
        })
    };   

    sText(element, target, name){
        element.innerText = Reflect.get(target, name);
    }

    sModel(element, target, name){
        element.value = Reflect.get(target, name)
    }

};

const MyFramework = {
    createApp(options){
        return new ElementReactive(options)
    }
}