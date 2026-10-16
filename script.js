// ========================================
// INVENTORY MANAGEMENT SYSTEM
// Frontend Prototype
// ========================================

// Load saved data or create demo data

const demoProducts = [
    {
        id: 1,
        name: "Basmati Rice 1kg",
        category: "Grocery",
        cost: 75,
        price: 95,
        stock: 45,
        limit: 10
    },
    {
        id: 2,
        name: "Notebook A4",
        category: "Stationery",
        cost: 35,
        price: 50,
        stock: 8,
        limit: 10
    },
    {
        id: 3,
        name: "Cooking Oil 1L",
        category: "Grocery",
        cost: 120,
        price: 145,
        stock: 25,
        limit: 8
    },
    {
        id: 4,
        name: "Blue Ball Pen",
        category: "Stationery",
        cost: 5,
        price: 10,
        stock: 60,
        limit: 15
    },
    {
        id: 5,
        name: "Sugar 1kg",
        category: "Grocery",
        cost: 38,
        price: 45,
        stock: 5,
        limit: 10
    }
];

let products = JSON.parse(localStorage.getItem("sf_products"));

if (products === null) {
    products = demoProducts;
}

let sales = JSON.parse(localStorage.getItem("sf_sales")) || [];
let expenses = JSON.parse(localStorage.getItem("sf_expenses")) || [];


// ========================================
// HELPER FUNCTIONS
// ========================================

function saveData() {
    localStorage.setItem("sf_products", JSON.stringify(products));
    localStorage.setItem("sf_sales", JSON.stringify(sales));
    localStorage.setItem("sf_expenses", JSON.stringify(expenses));
}

function formatMoney(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function getDate() {
    return new Date().toLocaleDateString("en-IN");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[char];
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(function () {
        toast.style.display = "none";
    }, 3000);
}


// ========================================
// PAGE NAVIGATION
// ========================================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(function (page) {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId).classList.add("active-page");

    document.querySelectorAll(".nav-item").forEach(function (item) {
        item.classList.remove("active");
    });

    const buttons = document.querySelectorAll(".nav-item");

    buttons.forEach(function (button) {
        if (button.getAttribute("onclick").includes("'" + pageId + "'")) {
            button.classList.add("active");
        }
    });

    const titles = {
        dashboard: "Dashboard",
        products: "Products",
        inventory: "Inventory",
        sales: "Sales Management",
        expenses: "Expense Tracking",
        reports: "Business Reports"
    };

    document.getElementById("pageTitle").textContent = titles[pageId];

    renderAll();
}


// ========================================
// MODAL FUNCTIONS
// ========================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("show");
}

function openProductModal() {
    document.getElementById("productForm").reset();
    document.getElementById("editProductId").value = "";
    document.getElementById("productModalTitle").textContent = "Add New Product";

    document.getElementById("productModal").classList.add("show");
}

function openSaleModal() {

    const select = document.getElementById("saleProduct");

    select.innerHTML = "";

    products.forEach(function (product) {

        if (product.stock > 0) {
            const option = document.createElement("option");

            option.value = product.id;
            option.textContent =
                product.name + " - " +
                formatMoney(product.price) +
                " (Stock: " + product.stock + ")";

            select.appendChild(option);
        }
    });

    if (select.options.length === 0) {
        showToast("No products available for sale.");
        return;
    }

    document.getElementById("saleForm").reset();
    document.getElementById("saleModal").classList.add("show");
}

function openExpenseModal() {
    document.getElementById("expenseForm").reset();
    document.getElementById("expenseModal").classList.add("show");
}


// ========================================
// PRODUCT MANAGEMENT
// ========================================

document.getElementById("productForm").addEventListener("submit", function (event) {

    event.preventDefault();

    const editId = document.getElementById("editProductId").value;

    const product = {
        id: editId ? Number(editId) : Date.now(),
        name: document.getElementById("productName").value.trim(),
        category: document.getElementById("productCategory").value,
        cost: Number(document.getElementById("productCost").value),
        price: Number(document.getElementById("productPrice").value),
        stock: Number(document.getElementById("productStock").value),
        limit: Number(document.getElementById("productLimit").value)
    };

    if (!product.name ||
        !Number.isFinite(product.cost) ||
        !Number.isFinite(product.price) ||
        !Number.isInteger(product.stock) ||
        !Number.isInteger(product.limit) ||
        product.cost < 0 ||
        product.price < 0 ||
        product.stock < 0 ||
        product.limit < 0) {

        showToast("Please enter valid product details.");
        return;
    }

    if (editId) {

        const index = products.findIndex(function (p) {
            return p.id === Number(editId);
        });

        if (index === -1) {
            showToast("Product not found.");
            return;
        }

        products[index] = product;
        showToast("Product updated successfully!");

    } else {

        products.push(product);
        showToast("Product added successfully!");
    }

    saveData();
    closeModal("productModal");
    renderAll();
});


function editProduct(id) {

    const product = products.find(function (p) {
        return p.id === id;
    });

    if (!product) return;

    document.getElementById("editProductId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productCost").value = product.cost;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock;
    document.getElementById("productLimit").value = product.limit;

    document.getElementById("productModalTitle").textContent = "Edit Product";
    document.getElementById("productModal").classList.add("show");
}


function deleteProduct(id) {

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    products = products.filter(function (product) {
        return product.id !== id;
    });

    saveData();
    renderAll();
    showToast("Product deleted successfully!");
}


function getStockBadge(product) {

    if (product.stock === 0) {
        return '<span class="badge badge-danger">Out of Stock</span>';
    }

    if (product.stock <= product.limit) {
        return '<span class="badge badge-warning">Low Stock</span>';
    }

    return '<span class="badge badge-success">In Stock</span>';
}


function renderProducts() {

    const search = document.getElementById("productSearch").value.toLowerCase();

    const filtered = products.filter(function (product) {
        return product.name.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search);
    });

    document.getElementById("productCountLabel").textContent =
        filtered.length + " products";

    const table = document.getElementById("productsTable");

    if (filtered.length === 0) {
        table.innerHTML =
            '<tr><td colspan="7" class="empty-state">No products found.</td></tr>';
        return;
    }

    table.innerHTML = filtered.map(function (product) {

        return `
            <tr>
                <td><strong>${escapeHTML(product.name)}</strong></td>
                <td>${escapeHTML(product.category)}</td>
                <td>${formatMoney(product.cost)}</td>
                <td>${formatMoney(product.price)}</td>
                <td>${product.stock}</td>
                <td>${getStockBadge(product)}</td>
                <td>
                    <button class="action-btn edit-btn"
                        onclick="editProduct(${product.id})">Edit</button>

                    <button class="action-btn delete-btn"
                        onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `;

    }).join("");
}


// ========================================
// INVENTORY MANAGEMENT
// ========================================

function updateStock(id) {

    const input = document.getElementById("stock_" + id);

    const newStock = Number(input.value);

    if (!Number.isInteger(newStock) || newStock < 0) {
        showToast("Enter a valid stock quantity.");
        return;
    }

    const product = products.find(function (p) {
        return p.id === id;
    });

    if (!product) return;

    product.stock = newStock;

    saveData();
    renderAll();

    showToast("Stock updated successfully!");
}


function renderInventory() {

    const totalStock = products.reduce(function (sum, product) {
        return sum + product.stock;
    }, 0);

    const lowStock = products.filter(function (product) {
        return product.stock <= product.limit;
    }).length;

    const inventoryValue = products.reduce(function (sum, product) {
        return sum + (product.cost * product.stock);
    }, 0);

    document.getElementById("inventoryTotal").textContent = totalStock;
    document.getElementById("inventoryLow").textContent = lowStock;
    document.getElementById("inventoryValue").textContent =
        formatMoney(inventoryValue);

    const table = document.getElementById("inventoryTable");

    if (products.length === 0) {
        table.innerHTML =
            '<tr><td colspan="5" class="empty-state">No inventory available.</td></tr>';
        return;
    }

    table.innerHTML = products.map(function (product) {

        return `
            <tr>
                <td><strong>${escapeHTML(product.name)}</strong></td>
                <td>${escapeHTML(product.category)}</td>
                <td>${product.stock} units</td>
                <td>${getStockBadge(product)}</td>
                <td>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        class="stock-input"
                        id="stock_${product.id}"
                        value="${product.stock}"
                    >

                    <button class="action-btn edit-btn"
                        onclick="updateStock(${product.id})">
                        Update
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


// ========================================
// SALES MANAGEMENT
// ========================================

document.getElementById("saleForm").addEventListener("submit", function (event) {

    event.preventDefault();

    const productId = Number(document.getElementById("saleProduct").value);
    const quantity = Number(document.getElementById("saleQuantity").value);

    const product = products.find(function (p) {
        return p.id === productId;
    });

    if (!product) {
        showToast("Product not found.");
        return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        showToast("Enter a valid quantity.");
        return;
    }

    if (quantity > product.stock) {
        showToast("Not enough stock available!");
        return;
    }

    const sale = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
        cost: product.cost,
        total: product.price * quantity,
        date: getDate()
    };

    sales.push(sale);

    product.stock -= quantity;

    saveData();
    closeModal("saleModal");
    renderAll();

    showToast("Sale recorded successfully!");
});


function renderSales() {

    const revenue = sales.reduce(function (sum, sale) {
        return sum + sale.total;
    }, 0);

    const units = sales.reduce(function (sum, sale) {
        return sum + sale.quantity;
    }, 0);

    document.getElementById("salesRevenue").textContent = formatMoney(revenue);
    document.getElementById("salesTransactions").textContent = sales.length;
    document.getElementById("salesUnits").textContent = units;

    const table = document.getElementById("salesTable");

    if (sales.length === 0) {
        table.innerHTML =
            '<tr><td colspan="5" class="empty-state">No sales recorded yet.</td></tr>';
        return;
    }

    table.innerHTML = [...sales].reverse().map(function (sale) {

        return `
            <tr>
                <td>${escapeHTML(sale.date)}</td>
                <td>${escapeHTML(sale.productName)}</td>
                <td>${sale.quantity}</td>
                <td>${formatMoney(sale.price)}</td>
                <td><strong>${formatMoney(sale.total)}</strong></td>
            </tr>
        `;

    }).join("");
}


// ========================================
// EXPENSE MANAGEMENT
// ========================================

document.getElementById("expenseForm").addEventListener("submit", function (event) {

    event.preventDefault();

    const description =
        document.getElementById("expenseDescription").value.trim();

    const category =
        document.getElementById("expenseCategory").value;

    const amount =
        Number(document.getElementById("expenseAmount").value);

    if (!description || !Number.isFinite(amount) || amount <= 0) {
        showToast("Enter valid expense details.");
        return;
    }

    const expense = {
        id: Date.now(),
        description: description,
        category: category,
        amount: amount,
        date: getDate()
    };

    expenses.push(expense);

    saveData();
    closeModal("expenseModal");
    renderAll();

    showToast("Expense added successfully!");
});


function renderExpenses() {

    const total = expenses.reduce(function (sum, expense) {
        return sum + expense.amount;
    }, 0);

    const categories = new Set(
        expenses.map(function (expense) {
            return expense.category;
        })
    );

    document.getElementById("expensesTotal").textContent = formatMoney(total);
    document.getElementById("expensesCount").textContent = expenses.length;
    document.getElementById("expensesCategories").textContent = categories.size;

    const table = document.getElementById("expensesTable");

    if (expenses.length === 0) {
        table.innerHTML =
            '<tr><td colspan="4" class="empty-state">No expenses recorded yet.</td></tr>';
        return;
    }

    table.innerHTML = [...expenses].reverse().map(function (expense) {

        return `
            <tr>
                <td>${escapeHTML(expense.date)}</td>
                <td>${escapeHTML(expense.description)}</td>
                <td>${escapeHTML(expense.category)}</td>
                <td><strong>${formatMoney(expense.amount)}</strong></td>
            </tr>
        `;

    }).join("");
}


// ========================================
// BUSINESS REPORTS
// ========================================

function renderReports() {

    const revenue = sales.reduce(function (sum, sale) {
        return sum + sale.total;
    }, 0);

    const costOfGoods = sales.reduce(function (sum, sale) {
        return sum + (sale.cost * sale.quantity);
    }, 0);

    const totalExpenses = expenses.reduce(function (sum, expense) {
        return sum + expense.amount;
    }, 0);

    const profit = revenue - costOfGoods - totalExpenses;

    document.getElementById("reportRevenue").textContent =
        formatMoney(revenue);

    document.getElementById("reportCOGS").textContent =
        formatMoney(costOfGoods);

    document.getElementById("reportProfit").textContent =
        formatMoney(profit);

    document.getElementById("summaryRevenue").textContent =
        formatMoney(revenue);

    document.getElementById("summaryCOGS").textContent =
        formatMoney(costOfGoods);

    document.getElementById("summaryExpenses").textContent =
        formatMoney(totalExpenses);

    document.getElementById("summaryProfit").textContent =
        formatMoney(profit);

    document.getElementById("reportProfit").style.color =
        profit >= 0 ? "#059669" : "#dc2626";

    document.getElementById("summaryProfit").style.color =
        profit >= 0 ? "#059669" : "#dc2626";
}


// ========================================
// DASHBOARD
// ========================================

function renderDashboard() {

    const totalStock = products.reduce(function (sum, product) {
        return sum + product.stock;
    }, 0);

    const lowStockProducts = products.filter(function (product) {
        return product.stock <= product.limit;
    });

    const revenue = sales.reduce(function (sum, sale) {
        return sum + sale.total;
    }, 0);

    document.getElementById("totalProducts").textContent = products.length;
    document.getElementById("totalStock").textContent = totalStock;
    document.getElementById("totalSales").textContent = formatMoney(revenue);
    document.getElementById("lowStockCount").textContent =
        lowStockProducts.length;

    const recentTable = document.getElementById("recentSalesTable");

    const recentSales = [...sales].reverse().slice(0, 5);

    if (recentSales.length === 0) {
        recentTable.innerHTML =
            '<tr><td colspan="4" class="empty-state">No recent sales.</td></tr>';
    } else {

        recentTable.innerHTML = recentSales.map(function (sale) {

            return `
                <tr>
                    <td>${escapeHTML(sale.productName)}</td>
                    <td>${sale.quantity}</td>
                    <td>${formatMoney(sale.total)}</td>
                    <td>${escapeHTML(sale.date)}</td>
                </tr>
            `;

        }).join("");
    }

    const lowStockList = document.getElementById("lowStockList");

    if (lowStockProducts.length === 0) {
        lowStockList.innerHTML =
            '<div class="empty-state">All products have sufficient stock.</div>';
    } else {

        lowStockList.innerHTML = lowStockProducts.map(function (product) {

            return `
                <div class="low-stock-item">
                    <div>
                        <strong>${escapeHTML(product.name)}</strong>
                        <small>${escapeHTML(product.category)}</small>
                    </div>
                    <span>${product.stock} left</span>
                </div>
            `;

        }).join("");
    }
}


// ========================================
// RENDER EVERYTHING
// ========================================

function renderAll() {

    renderDashboard();
    renderProducts();
    renderInventory();
    renderSales();
    renderExpenses();
    renderReports();

    const container = document.getElementById("pieChartContainer");

    if (container && container.style.display === "block") {
        createFinancialPieChart();
    }
}


// Close modal by clicking outside

window.addEventListener("click", function (event) {

    if (event.target.classList.contains("modal")) {
        event.target.classList.remove("show");
    }
});


// Save initial demo data

saveData();

// Load website

renderAll();

console.log("StockFlow Inventory Management Prototype Loaded");
// ========================================
// FINANCIAL PIE CHART
// ========================================

let financialChart = null;

function togglePieChart() {

    const container = document.getElementById("pieChartContainer");

    if (container.style.display === "block") {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";

    createFinancialPieChart();
}


function createFinancialPieChart() {

    // Calculate sales revenue
    const revenue = sales.reduce(function (sum, sale) {
        return sum + sale.total;
    }, 0);

    // Calculate cost of goods sold
    const costOfGoods = sales.reduce(function (sum, sale) {
        return sum + (sale.cost * sale.quantity);
    }, 0);

    // Calculate operating expenses
    const operatingExpenses = expenses.reduce(function (sum, expense) {
        return sum + expense.amount;
    }, 0);

    // Calculate estimated net profit/loss
    const netProfit = revenue - costOfGoods - operatingExpenses;

    // Remove previous chart
    if (financialChart !== null) {
        financialChart.destroy();
    }

    const canvas = document.getElementById("financialPieChart");

    // A pie chart cannot represent negative profit.
    // Show costs and positive profit as portions of revenue.
    const chartLabels = [
        "Cost of Goods Sold",
        "Operating Expenses"
    ];

    const chartValues = [
        costOfGoods,
        operatingExpenses
    ];

    const chartColors = [
        "#f59e0b",
        "#ef4444"
    ];

    if (netProfit > 0) {
        chartLabels.push("Estimated Net Profit");
        chartValues.push(netProfit);
        chartColors.push("#10b981");
    }

    if (chartValues.every(function (value) {
        return value === 0;
    })) {
        chartLabels.length = 0;
        chartValues.length = 0;

        chartLabels.push("No Financial Data");
        chartValues.push(1);
        chartColors.length = 0;
        chartColors.push("#e5e7eb");
    }

    financialChart = new Chart(canvas, {

        type: "pie",

        data: {
            labels: chartLabels,

            datasets: [{
                data: chartValues,
                backgroundColor: chartColors,
                borderWidth: 3,
                borderColor: "#ffffff",
                hoverOffset: 12
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {

                legend: {
                    position: "bottom",

                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.label + ": " +
                                formatMoney(context.parsed);
                        }
                    }
                },

                title: {
                    display: true,
                    text: "Financial Distribution"
                }
            }
        }
    });

    // Revenue and net profit/loss remain visible
    // in the Financial Summary above the chart.
}
// ================================
// DEMO LOGIN SYSTEM
// ================================

function checkLogin() {

    const loggedIn = sessionStorage.getItem("stockflow_logged_in");

    if (loggedIn === "true") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("mainApp").style.display = "flex";
    } else {
        document.getElementById("loginPage").style.display = "flex";
        document.getElementById("mainApp").style.display = "none";
    }
}

document.getElementById("loginForm").addEventListener("submit", function (event) {

    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();

    const password = document.getElementById("loginPassword").value;

    if (username === "admin" && password === "admin123") {

        sessionStorage.setItem("stockflow_logged_in", "true");

        document.getElementById("loginError").textContent = "";

        checkLogin();

        showToast("Login successful!");

    } else {

        document.getElementById("loginError").textContent =
            "Invalid username or password!";
    }
});


function logout() {

    sessionStorage.removeItem("stockflow_logged_in");

    document.getElementById("loginForm").reset();

    checkLogin();
}


function togglePassword() {

    const password = document.getElementById("loginPassword");

    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}


// Check login when website loads

checkLogin();
// ========================================
// EXCEL IMPORT - ADD AND UPDATE PRODUCTS
// ========================================

function importExcel(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (typeof XLSX === "undefined") {
        showToast("Excel library could not load.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const data = new Uint8Array(e.target.result);

            const workbook = XLSX.read(data, {
                type: "array"
            });

            const sheetName = workbook.SheetNames[0];

            const worksheet = workbook.Sheets[sheetName];

            const excelData = XLSX.utils.sheet_to_json(worksheet, {
                defval: ""
            });

            let added = 0;
            let updated = 0;
            let skipped = 0;

            const importedProducts = [];

            excelData.forEach(function (row) {

                const name = String(row["Product Name"] || "").trim();

                const category = String(row["Category"] || "").trim();

                const cost = Number(row["Cost Price"]);

                const price = Number(row["Selling Price"]);

                const stock = Number(row["Stock"]);

                const limit = Number(row["Low Stock Limit"]);

                if (
                    !name ||
                    !category ||
                    row["Cost Price"] === "" ||
                    row["Selling Price"] === "" ||
                    row["Stock"] === "" ||
                    row["Low Stock Limit"] === "" ||
                    !Number.isFinite(cost) ||
                    !Number.isFinite(price) ||
                    !Number.isInteger(stock) ||
                    !Number.isInteger(limit) ||
                    cost < 0 ||
                    price < 0 ||
                    stock < 0 ||
                    limit < 0
                ) {
                    skipped++;
                    return;
                }

                importedProducts.push({
                    name: name,
                    category: category,
                    cost: cost,
                    price: price,
                    stock: stock,
                    limit: limit
                });

            });

            if (importedProducts.length === 0) {
                showToast("No valid products found in Excel.");
                return;
            }

            // Process imported products

            importedProducts.forEach(function (newProduct) {

                const existingProduct = products.find(function (product) {

                    return (
                        product.name.trim().toLowerCase() ===
                        newProduct.name.toLowerCase()
                        &&
                        product.category.trim().toLowerCase() ===
                        newProduct.category.toLowerCase()
                    );

                });

                if (existingProduct) {

                    existingProduct.cost = newProduct.cost;

                    existingProduct.price = newProduct.price;

                    existingProduct.stock = newProduct.stock;

                    existingProduct.limit = newProduct.limit;

                    updated++;

                } else {

                    products.push({
                        id: Date.now() + Math.floor(Math.random() * 1000000),
                        name: newProduct.name,
                        category: newProduct.category,
                        cost: newProduct.cost,
                        price: newProduct.price,
                        stock: newProduct.stock,
                        limit: newProduct.limit
                    });

                    added++;
                }

            });

            saveData();

            renderAll();

            alert(
                "Excel Import Completed!\n\n" +
                "Products Added: " + added + "\n" +
                "Products Updated: " + updated + "\n" +
                "Rows Skipped: " + skipped
            );

        } catch (error) {

            console.error(error);

            showToast("Error reading Excel file.");

        } finally {

            event.target.value = "";

        }
    };

    reader.readAsArrayBuffer(file);
}