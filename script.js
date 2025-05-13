// Ambil element display dari DOM
let display = document.getElementById('display');

// Variabel untuk IndexedDB
let db;
const DB_NAME = 'CalculatorHistoryDB';
const DB_VERSION = 1;
const STORE_NAME = 'calculations';

// Inisialisasi database
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: true 
        });
      }
    };
    
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    
    request.onerror = (event) => {
      reject('Error opening database: ' + event.target.error);
    };
  });
}

// Fungsi untuk menyimpan perhitungan
async function saveCalculation(expression, result) {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const calculation = {
      expression: expression,
      result: result,
      timestamp: new Date().getTime()
    };
    
    const request = store.add(calculation);
    
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject('Error saving calculation: ' + event.target.error);
  });
}

// Fungsi untuk mendapatkan riwayat
async function getHistory() {
  if (!db) await initDB();
  
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

// Fungsi untuk menambahkan nilai ke display
function appendToDisplay(value) {
  display.value += value;
}

// Fungsi untuk mengosongkan display
function clearDisplay() {
  display.value = '';
}

// Fungsi kalkulasi yang dimodifikasi untuk menyimpan riwayat
async function calculate() {
  try {
    const expression = display.value;
    const result = eval(expression);
    display.value = result;
    
    // Simpan ke IndexedDB
    await saveCalculation(expression, result);
    
    // Untuk debugging, tampilkan riwayat di console
    const history = await getHistory();
    console.log('Calculation history:', history);
  } catch (error) {
    display.value = 'Error';
  }
}

// Inisialisasi database saat pertama kali load
initDB().catch(console.error);