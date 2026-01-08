const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_FILE = path.join(__dirname, 'database.json');

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (e) { return []; }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

app.get('/api/products', (req, res) => {
    res.json(readData());
});

app.post('/api/products', (req, res) => {
    const products = readData();
    const newProduct = { id: Date.now(), views: 0, ...req.body };
    products.unshift(newProduct);
    writeData(products);
    res.json({ message: "Success", product: newProduct });
});

// ບ່ອນຮັບການນັບ View (ຕ້ອງມີເພື່ອໃຫ້ index.html ບໍ່ Error)
app.post('/api/products/:id/view', (req, res) => {
    const products = readData();
    const productIndex = products.findIndex(p => p.id == req.params.id);
    if (productIndex !== -1) {
        products[productIndex].views = (products[productIndex].views || 0) + 1;
        writeData(products);
        res.json({ success: true });
    } else {
        res.status(404).send("Product not found");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
