document.addEventListener("DOMContentLoaded", () => {
    const schemaType = document.getElementById("schemaType");
    const formFields = document.getElementById("formFields");
    const generateButton = document.getElementById("generateButton");
    const resultArea = document.getElementById("resultArea");
    const schemaOutput = document.getElementById("schemaOutput");
    const copyButton = document.getElementById("copyButton");

    // Function to clear form fields
    function clearFormFields() {
        formFields.innerHTML = "";
    }

    // Function to generate dynamic form fields based on schema type
    function generateFormFields(type) {
        clearFormFields();
        let fields = "";

        if (type === "article") {
            fields = `
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
            `;
        } else if (type === "organization") {
            fields = `
                <div class="form-group">
                    <label for="orgName">Organization Name:</label>
                    <input type="text" id="orgName" class="form-control" placeholder="Enter organization name">
                </div>
                <div class="form-group">
                    <label for="orgUrl">Website URL:</label>
                    <input type="url" id="orgUrl" class="form-control" placeholder="Enter website URL">
                </div>
            `;
        } else if (type === "product") {
            fields = `
                <div class="form-group">
                    <label for="productName">Product Name:</label>
                    <input type="text" id="productName" class="form-control" placeholder="Enter product name">
                </div>
                <div class="form-group">
                    <label for="productPrice">Price:</label>
                    <input type="number" id="productPrice" class="form-control" placeholder="Enter price">
                </div>
            `;
        }

        formFields.innerHTML = fields;
    }

    // Function to generate schema markup
    function generateSchema() {
        const type = schemaType.value;

        if (type === "article") {
            const headline = document.getElementById("articleHeadline").value;
            const author = document.getElementById("articleAuthor").value;
            const date = document.getElementById("articleDate").value;

            if (!headline || !author || !date) {
                alert("Please fill in all fields.");
                return;
            }

            const schema = {
                "@context": "https://schema.org",
                "@type": "Article",
                headline,
                author,
                datePublished: date
            };

            schemaOutput.value = JSON.stringify(schema, null, 2);
        } else if (type === "organization") {
            const name = document.getElementById("orgName").value;
            const url = document.getElementById("orgUrl").value;

            if (!name || !url) {
                alert("Please fill in all fields.");
                return;
            }

            const schema = {
                "@context": "https://schema.org",
                "@type": "Organization",
                name,
                url
            };

            schemaOutput.value = JSON.stringify(schema, null, 2);
        } else if (type === "product") {
            const name = document.getElementById("productName").value;
            const price = document.getElementById("productPrice").value;

            if (!name || !price) {
                alert("Please fill in all fields.");
                return;
            }

            const schema = {
                "@context": "https://schema.org",
                "@type": "Product",
                name,
                offers: {
                    "@type": "Offer",
                    price,
                    priceCurrency: "USD"
                }
            };

            schemaOutput.value = JSON.stringify(schema, null, 2);
        }

        resultArea.classList.remove("hidden");
    }

    // Function to copy schema to clipboard
    function copyToClipboard() {
        schemaOutput.select();
        schemaOutput.setSelectionRange(0, 99999); // For mobile devices
        navigator.clipboard.writeText(schemaOutput.value).then(() => {
            alert("Schema copied to clipboard!");
        });
    }

    // Event listeners
    schemaType.addEventListener("change", () => generateFormFields(schemaType.value));
    generateButton.addEventListener("click", generateSchema);
    copyButton.addEventListener("click", copyToClipboard);

    // Initialize form fields
    generateFormFields(schemaType.value);
});