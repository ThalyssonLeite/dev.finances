const newTransactionButton = document.getElementById('newTransaction')

const cancelModalButton = document.querySelector("#modal button.cancel")

const modalForm = document.querySelector("#modal form")

const cancelDeleteModalButton = document.querySelector("#delete-modal-overlay .no")

const confirmDeleteModalButton = document.querySelector("#delete-modal-overlay .yes")

//FUNCTIONS
function preventDefaultAction(event) {
    event.preventDefault();
}

//EVENT LISTENERS
newTransactionButton.addEventListener('click', event => {
    Modal.toggle()
    preventDefaultAction(event)
})

cancelModalButton.addEventListener('click', event => {
    Modal.toggle()
    preventDefaultAction(event)
})

modalForm.addEventListener("submit", event => {
    preventDefaultAction(event)
    Form.submitButton()
})

cancelDeleteModalButton.addEventListener('click', event => {
    Modal.deleteModalToggle.toggle()
    preventDefaultAction(event)
})

confirmDeleteModalButton.addEventListener('click', event => {
    Modal.deleteModalToggle.delete()
    Modal.deleteModalToggle.toggle()
    preventDefaultAction(event)
})


//POO
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Modal = {
    deleteModal: document.getElementById('delete-modal-overlay'),

    deleteModalTransactionIndex: document.querySelector('#delete-modal-overlay div'),

    modal: document.getElementById('modal-overlay'),

    toggle() {
        this.modal.classList.toggle('active')
        Form.clearFields()
    },

    deleteModalToggle: {
    
        inceptionToggle(index) {
            this.toggle()

            index = index.srcElement.getAttribute("dataset")

            Modal.deleteModalTransactionIndex.innerHTML = index
        },

        toggle() {
            Modal.deleteModal.classList.toggle("active")
        },

        delete() {
            const transactionIndex = Modal.deleteModalTransactionIndex.innerHTML

            Transactions.remove(transactionIndex)
        }
    }
}

const DOM = {
    tbody: document.querySelector("table tbody"),

    addTransaction(transaction) {
        const tr = document.createElement("tr")
        tr.innerHTML = this.innerTableRowHTML(transaction)
        
        this.tbody.appendChild(tr)
    },

    innerTableRowHTML(transaction) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td id="date">${transaction.date}</td>
            <td>
                <img src="assets/minus.svg" alt="botão de excluir" title="Remover">
            </td>`

        return html
    },

    updateBalance() {
        document
            .querySelector(".card #incomes")
            .innerHTML = Transactions.incomes()

        document
            .querySelector(".card #expenses")
            .innerHTML = Transactions.expenses()

        document
            .querySelector(".card #total")
            .innerHTML = Transactions.total().amount
    },

    changeTotalBackgroundColor() {
        if (Transactions.total().red) {
            document
                .querySelector(".card:last-child")
                .classList
                .add('red')
        } else if (!Transactions.total().red) {
            document
                .querySelector(".card:last-child")
                .classList
                .remove('red')
        }
    },

    cleanTransactionsTable() {
        this.tbody.innerHTML = ""
    },

    addEventListenerToDeleteElement(index) {
        const deleteButton = document.querySelector("#data-table tbody tr:last-child img")

        deleteButton.setAttribute("dataset", index)

        deleteButton.addEventListener("click", (event) => {
            Modal.deleteModalToggle.inceptionToggle(event)
        })
    }


}

const Transactions = {
    allTransactions: Storage.get(),

    add(transaction) {
        this.allTransactions.push(transaction)

        App.reload()
    },

    remove(index) {
        this.allTransactions.splice(index, 1);

        App.reload()
    },

    incomes() {
        let incomes = this.allTransactions
            .filter(transaction => transaction.amount > 0)
            .reduce((a, b) => a + b.amount, 0)

        const formatedIncomes = Utils
            .formatCurrencyNoSignal(incomes)

        return formatedIncomes
    },
    expenses() {
        const expenses = this.allTransactions
            .filter(transaction => transaction.amount < 0)
            .reduce((a, b) => a + b.amount, 0)

        const formatedExpenses = Utils.formatCurrencyNoSignal(expenses)

        return formatedExpenses
    },
    total() {
        const total = this.allTransactions
            .reduce((a, b) => a + b.amount, 0)

        const formatedTotal = Utils.formatCurrency(total)

        const response = {
            amount: formatedTotal,
            red: total < 0 ? true : false
        }

        return response
    },
    
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\.\,/g, "")) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        const reverseSplittedDate = splittedDate.reverse()

        const formatedDate = reverseSplittedDate.join("/")

        return formatedDate
    },

    formatCurrency(value) {
        if (!value) {
            return this.formatCurrencyNoSignal(value)
        }

        const signal = value > 0 ? '+ ' : '- ';

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100
        
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return (signal + value)
    },

    formatCurrencyNoSignal(value) {
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100
        
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return value
    }
}

const Form = {
    description: document.querySelector("input#description"),

    amount: document.querySelector("input#amount"),

    date: document.querySelector("input#date"),

    getValues() {
        const inputFieldsValue = {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }

        return inputFieldsValue
    },

    validateFields() {
        const { description, amount, date } = this.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim === "") {
            throw new Error("Por favor preencha todos os campos do formulário.")
        }
    },

    formatFields() {
        let { description, amount, date } = this.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        const formatedFields = {
            description,
            amount,
            date
        }

        return formatedFields
    },

    clearFields() {
        this.description.value = null
        this.amount.value = null
        this.date.value = null
    },

    submitButton(event) {
        try {
            this.validateFields()
        } catch(error) {
            alert(error.message)
        }

        const newTransaction = this.formatFields()

        Transactions.add(newTransaction)

        Modal.toggle()
    }
}



const App = {
    init() {
        Transactions.allTransactions.forEach((transaction, index) => {
            DOM.addTransaction(transaction)
            DOM.updateBalance()
            DOM.changeTotalBackgroundColor()
            DOM.addEventListenerToDeleteElement(index)
            Storage.set(Transactions.allTransactions)
        })

        if (Transactions.allTransactions.length < 1) {
            DOM.updateBalance()
            DOM.changeTotalBackgroundColor()
        }
    },

    reload() {
        DOM.cleanTransactionsTable()
        this.init()
    }
}

App.init()
