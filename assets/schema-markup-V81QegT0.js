import"./modulepreload-polyfill-B5Qt9EMX.js";document.addEventListener("DOMContentLoaded",()=>{const a=document.getElementById("schemaType"),n=document.getElementById("formFields"),i=document.getElementById("generateButton"),d=document.getElementById("resultArea"),r=document.getElementById("schemaOutput"),s=document.getElementById("copyButton");function u(){n.innerHTML=""}function c(l){u();let e="";l==="article"?e=`
                <div class="form-group">
                    <label for="articleHeadline">Headline:</label>
                    <input type="text" id="articleHeadline" class="form-control" placeholder="Enter article headline">
                </div>
                <div class="form-group">
                    <label for="articleAuthor">Author:</label>
                    <input type="text" id="articleAuthor" class="form-control" placeholder="Enter author name">
                </div>
                <div class="form-group">
                    <label for="articleDate">Published Date:</label>
                    <input type="date" id="articleDate" class="form-control">
                </div>
            `:l==="organization"?e=`
                <div class="form-group">
                    <label for="orgName">Organization Name:</label>
                    <input type="text" id="orgName" class="form-control" placeholder="Enter organization name">
                </div>
                <div class="form-group">
                    <label for="orgUrl">Website URL:</label>
                    <input type="url" id="orgUrl" class="form-control" placeholder="Enter website URL">
                </div>
            `:l==="product"&&(e=`
                <div class="form-group">
                    <label for="productName">Product Name:</label>
                    <input type="text" id="productName" class="form-control" placeholder="Enter product name">
                </div>
                <div class="form-group">
                    <label for="productPrice">Price:</label>
                    <input type="number" id="productPrice" class="form-control" placeholder="Enter price">
                </div>
            `),n.innerHTML=e}function m(){const l=a.value;if(l==="article"){const e=document.getElementById("articleHeadline").value,t=document.getElementById("articleAuthor").value,o=document.getElementById("articleDate").value;if(!e||!t||!o){alert("Please fill in all fields.");return}const f={"@context":"https://schema.org","@type":"Article",headline:e,author:t,datePublished:o};r.value=JSON.stringify(f,null,2)}else if(l==="organization"){const e=document.getElementById("orgName").value,t=document.getElementById("orgUrl").value;if(!e||!t){alert("Please fill in all fields.");return}const o={"@context":"https://schema.org","@type":"Organization",name:e,url:t};r.value=JSON.stringify(o,null,2)}else if(l==="product"){const e=document.getElementById("productName").value,t=document.getElementById("productPrice").value;if(!e||!t){alert("Please fill in all fields.");return}const o={"@context":"https://schema.org","@type":"Product",name:e,offers:{"@type":"Offer",price:t,priceCurrency:"USD"}};r.value=JSON.stringify(o,null,2)}d.classList.remove("hidden")}function p(){r.select(),r.setSelectionRange(0,99999),navigator.clipboard.writeText(r.value).then(()=>{alert("Schema copied to clipboard!")})}a.addEventListener("change",()=>c(a.value)),i.addEventListener("click",m),s.addEventListener("click",p),c(a.value)});
