let switche_theme_button = document.getElementById(`switche-theme`);



function Themer (id, class_array){
        let self = this;
        this.themes = {
            array : class_array,
            index : 0,
            get next() {
                console.log("getnext -> this.index", this.index)
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
        
    

    function swap() {
        event.preventDefault();
        if (document.body.classList.contains(self.themes.current)) {
            document.body.classList.remove(self.themes.current);
            document.body.classList.add(self.themes.next);
        } else {
            console.error(`Not found class`);
        }
        return false;
    }

    this.switcher.addEventListener('click', swap);
}

 let theme =new Themer(switche_theme_button, ['theme-light', 'theme-dark']);