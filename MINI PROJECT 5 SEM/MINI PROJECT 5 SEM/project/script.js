// Simple cart object: { itemName: { price: number, qty: number } }
const cart = {};
const GST_RATE = 0.05; // 5% GST

const addButtons = document.querySelectorAll(".add-btn");
const orderBody = document.getElementById("orderBody");
const orderTable = document.getElementById("orderTable");
const emptyMsg = document.getElementById("emptyMsg");

const subtotalEl = document.getElementById("subtotal");
const gstEl = document.getElementById("gst");
const grandTotalEl = document.getElementById("grandTotal");

const clearOrderBtn = document.getElementById("clearOrderBtn");
const proceedBillBtn = document.getElementById("proceedBillBtn");

// Add item to cart
if (addButtons) {
    addButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);

            if (!cart[name]) {
                cart[name] = { price: price, qty: 1 };
            } else {
                cart[name].qty += 1;
            }

            renderCart();
        });
    });
}

// Render cart table rows and totals
function renderCart() {
    if (!orderBody) return;

    orderBody.innerHTML = "";

    const itemNames = Object.keys(cart);

    if (itemNames.length === 0) {
        orderTable.style.display = "none";
        emptyMsg.style.display = "block";
        updateTotals();
        return;
    }

    orderTable.style.display = "table";
    emptyMsg.style.display = "none";

    itemNames.forEach(name => {
        const { price, qty } = cart[name];
        const amount = price * qty;

        const tr = document.createElement("tr");

        // Item name
        const nameTd = document.createElement("td");
        nameTd.textContent = name;
        tr.appendChild(nameTd);

        // Qty with + and - buttons
        const qtyTd = document.createElement("td");
        const qtyControls = document.createElement("div");
        qtyControls.className = "qty-controls";

        const minusBtn = document.createElement("button");
        minusBtn.className = "qty-btn";
        minusBtn.textContent = "-";
        minusBtn.onclick = () => {
            if (cart[name].qty > 1) {
                cart[name].qty -= 1;
            } else {
                delete cart[name];
            }
            renderCart();
        };

        const qtySpan = document.createElement("span");
        qtySpan.textContent = qty;

        const plusBtn = document.createElement("button");
        plusBtn.className = "qty-btn";
        plusBtn.textContent = "+";
        plusBtn.onclick = () => {
            cart[name].qty += 1;
            renderCart();
        };

        qtyControls.appendChild(minusBtn);
        qtyControls.appendChild(qtySpan);
        qtyControls.appendChild(plusBtn);

        qtyTd.appendChild(qtyControls);
        tr.appendChild(qtyTd);

        // Price
        const priceTd = document.createElement("td");
        priceTd.textContent = "₹" + price.toFixed(2);
        tr.appendChild(priceTd);

        // Amount
        const amountTd = document.createElement("td");
        amountTd.textContent = "₹" + amount.toFixed(2);
        tr.appendChild(amountTd);

        // Remove button
        const removeTd = document.createElement("td");
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "Remove";
        removeBtn.onclick = () => {
            delete cart[name];
            renderCart();
        };
        removeTd.appendChild(removeBtn);
        tr.appendChild(removeTd);

        orderBody.appendChild(tr);
    });

    updateTotals();
}

// Calculate subtotal, GST, grand total
function updateTotals() {
    if (!subtotalEl || !gstEl || !grandTotalEl) return;

    let subtotal = 0;
    Object.values(cart).forEach(item => {
        subtotal += item.price * item.qty;
    });

    const gstAmount = subtotal * GST_RATE;
    const grandTotal = subtotal + gstAmount;

    subtotalEl.textContent = "₹" + subtotal.toFixed(2);
    gstEl.textContent = "₹" + gstAmount.toFixed(2);
    grandTotalEl.textContent = "₹" + grandTotal.toFixed(2);
}

// Clear order
if (clearOrderBtn) {
    clearOrderBtn.addEventListener("click", () => {
        for (let key in cart) {
            delete cart[key];
        }
        renderCart();
    });
}

// Proceed to special bill page
if (proceedBillBtn) {
    proceedBillBtn.addEventListener("click", () => {
        const hasItems = Object.keys(cart).length > 0;
        if (!hasItems) {
            alert("No items in the order. Please add some food from the menu.");
            return;
        }

        // Prepare data
        let subtotal = 0;
        const itemsArray = Object.entries(cart).map(([name, data]) => {
            const amount = data.price * data.qty;
            subtotal += amount;
            return {
                name,
                price: data.price,
                qty: data.qty,
                amount
            };
        });

        const gstAmount = subtotal * GST_RATE;
        const grandTotal = subtotal + gstAmount;

        const billData = {
            items: itemsArray,
            subtotal,
            gst: gstAmount,
            total: grandTotal,
            time: new Date().toLocaleString()
        };

        // Store in localStorage
        localStorage.setItem("elite_dine_bill", JSON.stringify(billData));

        // Go to special bill page
        window.location.href = "bill.html";
    });
}

// Initial (only runs on menu page)
renderCart();
