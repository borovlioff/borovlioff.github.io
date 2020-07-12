let switche_theme_button = document.getElementById(`switche-theme`);

class theme{
    constructor(id, theme_body ,from , to){
        this.switcher = id;
        this.theme_body = theme_body;
        this.from = from; 
        this.to = to ; 


        this.switcher.addEventListener('click', swap);

       function swap(){
           let save;
            if(document.body.classList.contains(from)){
                document.body.classList.remove(from);
                document.body.classList.add(to);
                save = from;
                from = to;
                to = save;
            } else {
                console.error(`Not found class`);
            }
            return false;
        }
    }
    
}

new theme(switche_theme_button , document.body ,'theme-light', 'theme-dark');