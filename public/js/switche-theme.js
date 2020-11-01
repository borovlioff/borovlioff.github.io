let switche_theme_button = document.createElement('a');
let switch_theme_icon= document.createElement('i');

    switche_theme_button.id = "switche-theme";
    switche_theme_button.classList.add("btn-floating");
    switch_theme_icon.classList.add('material-icons');
    switch_theme_icon.textContent = "brightness_4";
    switche_theme_button.append(switch_theme_icon);
    document.body.append(switche_theme_button);

function Themer (id, class_array){
        let self = this;
        this.themes = {
            array : class_array,
            index : 0,
            get next() {
                if (this.index < this.array.length-1) {
                    
                    this.index += 1;
                    return this.array[self.themes.index]
                }
                else {
                    this.index = -1;
                    return self.themes.next;      
                }
            },

            get current(){
                return this.array[this.index];
            },

        };
        this.switcher = id;
        
    

    this.swap = function(event) {
        if(event){
        event.preventDefault();}
        if (document.body.classList.contains(self.themes.current)) {
            document.body.classList.remove(self.themes.current);
            document.body.classList.add(self.themes.next);
        } else {
            console.error(`Not found class`);
        }
        return false;
    }

    this.save = function(name){
        setItem('theme', name);
    }

    this.switcher.addEventListener('click', this.swap);
}

 let theme =new Themer(switche_theme_button, ['theme-light', 'theme-dark']);