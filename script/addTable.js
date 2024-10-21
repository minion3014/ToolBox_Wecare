document.getElementById('add-table-button').addEventListener('click', function () {
    // Hiển thị modal để nhập tên bảng mới
    document.getElementById('add-table-modal').style.display = 'flex';
});

// Xử lý việc gửi form để tạo bảng mới
document.getElementById('table-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Ngăn form gửi đi

    const newTableName = document.getElementById('new-table-name').value;

    // Tạo cấu trúc bảng mới
    const sheetContainer = document.createElement('div');
    sheetContainer.classList.add('sheet-container');

    const sheetHeader = document.createElement('div');
    sheetHeader.classList.add('sheet-header');

    const sheetTitle = document.createElement('h2');
    sheetTitle.textContent = newTableName; // Đặt tên bảng theo input của người dùng

    const toggleButton = document.createElement('button');
    toggleButton.classList.add('toggle-button');
    toggleButton.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';

    // Nút thêm cột
    const addColumnButton = document.createElement('button');
    addColumnButton.classList.add('add-column-button');
    addColumnButton.textContent = 'Thêm Cột';

    const tableElement = document.createElement('table');
    tableElement.style.tableLayout = 'fixed'; // Đảm bảo các cột chia đều
    const tableHead = document.createElement('thead');
    const tableBody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    tableHead.appendChild(headerRow);

    // Chức năng nút thu gọn/mở rộng bảng
    toggleButton.addEventListener('click', function () {
        if (tableElement.style.display === 'none') {
            tableElement.style.display = 'table';
            toggleButton.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        } else {
            tableElement.style.display = 'none';
            toggleButton.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
        }
    });

    // Chức năng thêm cột mới với dữ liệu random
    addColumnButton.addEventListener('click', function () {
        const newColumnName = prompt('Nhập tên cột mới:');
        if (!newColumnName) return;

        // Tạo tiêu đề cột mới
        const newHeader = document.createElement('th');
        newHeader.textContent = newColumnName;
        headerRow.appendChild(newHeader);

        // Thêm dữ liệu random vào các hàng đã có
        const rows = tableBody.querySelectorAll('tr');
        const randomValues = []; // Mảng để lưu giá trị random

        rows.forEach(row => {
            const randomNumber = Math.floor(Math.random() * 50) + 1; // Random số từ 1 đến 50
            const newCell = document.createElement('td');
            newCell.textContent = `${newColumnName} - ${randomNumber}`;
            row.appendChild(newCell);
            randomValues.push(randomNumber); // Thêm giá trị vào mảng
        });

        // Nếu chưa có hàng dữ liệu, tạo 5 dòng với dữ liệu random
        if (rows.length === 0) {
            for (let i = 0; i < 5; i++) {
                const newRow = document.createElement('tr');
                const randomNumber = Math.floor(Math.random() * 50) + 1; // Random số từ 1 đến 50
                const newDataCell = document.createElement('td');
                newDataCell.textContent = `${newColumnName} - ${randomNumber}`;
                newRow.appendChild(newDataCell);
                tableBody.appendChild(newRow);
                randomValues.push(randomNumber); // Thêm giá trị vào mảng
            }
        }

        // Lưu cột và dữ liệu random vào localStorage
        saveColumnToLocalStorage(newTableName, newColumnName, randomValues);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    buttonContainer.appendChild(toggleButton);
    buttonContainer.appendChild(addColumnButton); // Thêm nút thêm cột

    sheetHeader.appendChild(sheetTitle);
    sheetHeader.appendChild(buttonContainer);
    sheetContainer.appendChild(sheetHeader);
    sheetContainer.appendChild(tableElement); // Thêm bảng vào container
    tableElement.appendChild(tableHead);
    tableElement.appendChild(tableBody);

    // Thêm bảng mới vào khu vực hiển thị
    document.getElementById('excel-data').appendChild(sheetContainer);

    // Đóng modal thêm bảng
    document.getElementById('add-table-modal').style.display = 'none';

    // Reset input
    document.getElementById('new-table-name').value = '';
});

// Đóng modal khi nhấn nút "Đóng"
document.getElementById('close-table-modal').addEventListener('click', function () {
    document.getElementById('add-table-modal').style.display = 'none';
});

// Hàm lưu cột mới vào localStorage
function saveColumnToLocalStorage(tableName, columnName, randomData) {
    // Lấy dữ liệu hiện có từ localStorage
    const localData = JSON.parse(localStorage.getItem(tableName)) || [];

    // Tạo một mảng mới để lưu các giá trị của cột mới
    const newColumnData = randomData.map((value) => {
        return { [columnName]: value }; // Tạo đối tượng cho mỗi giá trị
    });

    // Nếu localData chưa có dữ liệu, khởi tạo nó với giá trị mới
    if (localData.length === 0) {
        localData.push(...newColumnData);
    } else {
        // Cập nhật localData với cột mới mà không thêm null
        for (let i = 0; i < randomData.length; i++) {
            if (localData[i]) {
                // Nếu đã có đối tượng tại chỉ số i, cập nhật nó với cột mới
                localData[i][columnName] = randomData[i]; // Thêm cột mới vào đối tượng
            } else {
                // Nếu không có đối tượng, tạo mới
                localData.push({ [columnName]: randomData[i] });
            }
        }
    }

    // Cập nhật lại dữ liệu trong localStorage
    localStorage.setItem(tableName, JSON.stringify(localData));
    console.log(`Đã lưu cột ${columnName} vào sheet ${tableName} trong localStorage.`);
}


