(function() {
    const form = document.querySelector(".validated-form")
    form.addEventListener("submit", (event) => {
        if(!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
        }

        form.classList.add("was-validated")
    }, false)
})()