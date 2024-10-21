let workbooks = {};  // Lưu workbook của tất cả các file
let fileIDs = {};  // Lưu ID của các file

document.addEventListener('DOMContentLoaded', function () {
    const inputElement = document.getElementById('input-excel');
    if (inputElement) {
        inputElement.addEventListener('change', handleFile, false);
    } else {
        console.error('Không tìm thấy phần tử với ID "input-excel"');
    }
});

// Hàm import file
function handleFile(e) {
    const files = e.target.files;
    if (!files.length) {
        alert('Vui lòng chọn ít nhất một tệp Excel.');
        return;
    }

    const excelDataDiv = document.getElementById('excel-data');
    excelDataDiv.innerHTML = '';  // Xóa nội dung cũ

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        const fileName = file.name.replace('.xlsx', '');  // Loại bỏ phần mở rộng .xlsx
        const fileID = `file_${index + 1}`;  // Tạo ID cho file

        reader.onload = function (e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            // Lấy dữ liệu hiện tại từ localStorage (nếu có)
            let existingData = JSON.parse(localStorage.getItem(fileID)) || {};

            // Duyệt qua từng sheet trong workbook
            workbook.SheetNames.forEach(sheetName => {
                if (sheetName === 'hiddenSheet') return;  // Bỏ qua hiddenSheet nếu có

                const worksheet = workbook.Sheets[sheetName];
                let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Format lại dữ liệu JSON thành array of objects
                const columns = jsonData[0];  // Lấy tên các cột
                const filteredColumns = columns.filter(col => typeof col === 'string' && !col.startsWith('(Do Not Modify)'));  // Loại bỏ các cột có tên chứa (Do Not Modify)

                const formattedRows = jsonData.slice(1).map(row => {
                    const rowObject = {};
                    row.forEach((cellData, index) => {
                        if (filteredColumns[index]) {
                            rowObject[filteredColumns[index]] = cellData;
                        }
                    });
                    return rowObject;
                });

                // Lưu sheet vào `existingData`, thêm mới hoặc cập nhật nếu đã có
                existingData[sheetName] = formattedRows;

                // Tiếp tục phần hiển thị dữ liệu lên giao diện
                const sheetContainer = document.createElement('div');
                sheetContainer.classList.add('sheet-container');
                sheetContainer.setAttribute('data-file-id', fileID);  // Lưu ID file vào div

                const sheetHeader = document.createElement('div');
                sheetHeader.classList.add('sheet-header');

                const sheetTitle = document.createElement('h2');
                sheetTitle.textContent = `${fileName}_${sheetName}`;  // Tên file sẽ là namefile_sheet

                const toggleButton = document.createElement('button');
                toggleButton.classList.add('toggle-button');
                toggleButton.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';

                const sheetContent = document.createElement('div');
                sheetContent.classList.add('sheet-content');
                sheetContent.style.display = 'none';
                console.log("shete contain", sheetContent);
                toggleButton.addEventListener('click', function () {
                    if (sheetContent.style.display === 'none') {
                        sheetContent.style.display = 'block';
                        toggleButton.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
                    } else {
                        sheetContent.style.display = 'none';
                        toggleButton.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
                    }
                });

                const addButton = document.createElement('button');
                addButton.classList.add('add-button');
                addButton.textContent = 'Thêm Dữ Liệu';

                // Thêm sự kiện cho nút "Thêm Dữ Liệu"
                addButton.addEventListener('click', function () {
                    showAddDataPopup(fileID, sheetName, jsonData[1]);  // Pass file ID và sheet name cho popup
                });

                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');
                buttonContainer.appendChild(toggleButton);
                buttonContainer.appendChild(addButton);

                sheetHeader.appendChild(sheetTitle);
                sheetHeader.appendChild(buttonContainer);
                sheetContainer.appendChild(sheetHeader);

                // Kiểm tra nếu không có dữ liệu
                if (jsonData.length === 0) {
                    const noDataMsg = document.createElement('p');
                    noDataMsg.textContent = 'Sheet này không có dữ liệu.';
                    sheetContent.appendChild(noDataMsg);
                } else {
                    const table = document.createElement('table');
                    table.classList.add('excel-table');
                    const tbody = document.createElement('tbody');

                    // Header
                    const headerRow = document.createElement('tr');
                    filteredColumns.forEach(function (cellData, index) {
                        const th = document.createElement('th');
                        th.textContent = cellData !== undefined ? cellData : '';

                        // Cập nhật style cho ô tên cột
                        th.style.whiteSpace = 'nowrap';  // Ngăn văn bản xuống dòng
                        th.style.overflow = 'hidden';  // Ẩn phần thừa nếu vượt ra ngoài
                        th.style.textOverflow = 'ellipsis';  // Hiển thị dấu ba chấm "..." khi văn bản quá dài
                        th.style.maxWidth = '150px';  // Giới hạn chiều rộng cột

                        headerRow.appendChild(th);
                    });
                    table.appendChild(headerRow);

                    // Dữ liệu bảng
                    for (let i = 1; i < jsonData.length; i++) {
                        const rowData = jsonData[i];
                        const row = document.createElement('tr');
                        rowData.forEach(function (cellData, cellIndex) {
                            const td = document.createElement('td');
                            td.textContent = cellData !== undefined ? cellData : '';

                            // Cập nhật style cho ô dữ liệu
                            td.style.whiteSpace = 'nowrap';  // Ngăn văn bản xuống dòng
                            td.style.overflow = 'hidden';  // Ẩn phần thừa nếu vượt ra ngoài
                            td.style.textOverflow = 'ellipsis';  // Hiển thị dấu ba chấm "..." khi văn bản quá dài
                            td.style.maxWidth = '150px';  // Giới hạn chiều rộng ô

                            row.appendChild(td);
                        });
                        tbody.appendChild(row);

                        // Chỉ hiển thị tối đa 5 dòng
                        if (i === 5) break;
                    }

                    table.appendChild(tbody);
                    sheetContent.appendChild(table);

                    // Thêm thanh cuộn nếu có nhiều cột
                    if (filteredColumns.length > 10) {
                        sheetContent.style.overflowX = 'auto';
                        sheetContent.style.whiteSpace = 'nowrap';
                    }

                    // Thêm thanh cuộn nếu có nhiều dòng
                    if (jsonData.length > 6) {
                        sheetContent.style.overflowY = 'auto';
                        sheetContent.style.maxHeight = '200px';  // Giới hạn chiều cao của bảng
                    }
                }

                sheetContainer.appendChild(sheetContent);
                excelDataDiv.appendChild(sheetContainer);
            });

            // Cập nhật dữ liệu vào localStorage với key là fileID
            localStorage.setItem(fileID, JSON.stringify(existingData));

            // Lưu vào biến global để sử dụng sau này
            workbooks[fileID] = workbook;
            fileIDs[fileName] = fileID;  // Lưu tên file với fileID
        };

        reader.onerror = function (ex) {
            console.error('Error reading file', ex);
            alert('Đã xảy ra lỗi khi đọc tệp.');
        };

        reader.readAsBinaryString(file);
    });
}

function showAddDataPopup(fileID, sheetName, dataRow) {
    const popup = document.getElementById('popup1');
    const overlay = document.getElementById('overlay');
    const form = document.getElementById('data-form');
    const saveDataButton = document.getElementById('save-data');
    const newColumn = document.getElementById('new-column');
    const closePopupButton = document.getElementById('close-popup');

    // Hiển thị popup và lớp nền mờ
    popup.style.display = 'block';
    overlay.style.display = 'block';

    setTimeout(() => {
        if (!form) {
            console.error('Không tìm thấy form trong popup');
            return;
        }

        // Xóa nội dung form cũ
        form.innerHTML = '';

        const workbook = workbooks[fileID];  // Lấy đúng workbook theo file ID
        const worksheet = workbook.Sheets[sheetName];  // Lấy đúng sheet theo tên
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });  // Chuyển sheet thành JSON
        const columnNames = jsonData[0];  // Lấy tên các cột từ dòng đầu tiên

        // Loại bỏ các cột có tên chứa "(Do Not Modify)"
        const filteredColumnNames = columnNames.filter(col => !col.includes('(Do Not Modify)'));

        const formScroll = document.createElement('div');
        formScroll.classList.add('form-scroll');

        // Tạo input cho từng cột hiện tại
        filteredColumnNames.forEach((columnName, index) => {
            const inputGroup = document.createElement('div');
            inputGroup.classList.add('input-group');

            const label = document.createElement('label');
            label.textContent = columnName;  // Hiển thị tên cột từ file Excel
            inputGroup.appendChild(label);

            const input = document.createElement('input');
            input.type = 'text';
            input.name = `column_${index + 1}`;
            input.value = '';  // Giá trị mặc định
            inputGroup.appendChild(input);

            formScroll.appendChild(inputGroup);
        });

        form.appendChild(formScroll);  // Thêm formScroll vào form

        // Khi nhấn nút "Lưu Dữ Liệu"
        saveDataButton.onclick = function () {
            const formData = new FormData(form);
            const updatedRow = [];

            formData.forEach((value) => {
                updatedRow.push(value);  // Thu thập dữ liệu từ form
            });

            // Cập nhật dữ liệu sheet với dòng mới dưới dạng object
            let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const newDataObject = {};
            filteredColumnNames.forEach((colName, index) => {
                newDataObject[colName] = updatedRow[index] !== undefined ? updatedRow[index] : null;
            });

            console.log('Dữ liệu nhập vào (dưới dạng object):', newDataObject);

            // Cập nhật dữ liệu JSON
            jsonData.push(newDataObject);

            // Chuyển jsonData thành array of arrays
            const updatedDataArray = [filteredColumnNames];
            jsonData.slice(1).forEach(rowObject => {
                const rowArray = filteredColumnNames.map(col => rowObject[col]);
                updatedDataArray.push(rowArray);
            });

            // Cập nhật sheet
            const updatedSheet = XLSX.utils.aoa_to_sheet(updatedDataArray);
            workbook.Sheets[sheetName] = updatedSheet;

            // Cập nhật bảng HTML (thêm dòng mới)
            const table = document.querySelector(`.sheet-container[data-file-id="${fileID}"] .excel-table tbody`);
            const newRow = document.createElement('tr');
            updatedRow.forEach(function (cellData) {
                const td = document.createElement('td');
                td.textContent = cellData !== undefined ? cellData : '';
                newRow.appendChild(td);
            });
            table.appendChild(newRow);

            // Lưu dữ liệu vào localStorage
            saveDataToLocalStorage(fileID, sheetName, newDataObject);

            // Ẩn popup và lớp nền
            popup.style.display = 'none';
            overlay.style.display = 'none';
        };

        // Khi nhấn "Thêm Cột Mới"
        newColumn.addEventListener('click', function () {
            // Tạo form nhập liệu mới cho cột mới
            const newColumnName = prompt('Nhập tên cột mới:');  // Popup yêu cầu nhập tên cột mới
            if (!newColumnName) return;  // Nếu không nhập gì thì dừng

            // Thêm cột vào form
            const newInputGroup = document.createElement('div');
            newInputGroup.classList.add('input-group');

            const newLabel = document.createElement('label');
            newLabel.textContent = newColumnName;  // Hiển thị tên cột mới
            newInputGroup.appendChild(newLabel);

            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.name = `column_${filteredColumnNames.length + 1}`;  // Tạo tên mới cho input
            newInput.value = '';  // Giá trị mặc định là trống
            newInputGroup.appendChild(newInput);

            formScroll.appendChild(newInputGroup);  // Thêm cột mới vào form
            filteredColumnNames.push(newColumnName);  // Thêm tên cột vào danh sách tên cột

            // Cập nhật lại dữ liệu sheet trong localStorage với cột mới
            updateLocalStorageWithNewColumn(fileID, sheetName, filteredColumnNames);

            // **CẬP NHẬT BẢNG DỮ LIỆU (THÊM TÊN CỘT VÀ CỘT TRỐNG VÀO HTML)**
            const table = document.querySelector(`.sheet-container[data-file-id="${fileID}"] .excel-table`);

            // Thêm tiêu đề cột mới vào <thead>
            const tableHeaderRow = table.querySelector('thead tr');
            const newTableHeaderCell = document.createElement('th');
            newTableHeaderCell.textContent = newColumnName;  // Thêm tên cột mới vào header
            tableHeaderRow.appendChild(newTableHeaderCell);

            // Thêm cột trống vào tất cả các hàng hiện tại trong <tbody>
            const tableRows = table.querySelectorAll('tbody tr');
            tableRows.forEach(row => {
                const newCell = document.createElement('td');
                row.appendChild(newCell);  // Thêm ô trống vào từng dòng
            });
        });

        // Khi đóng popup
        closePopupButton.onclick = function () {
            popup.style.display = 'none';
            overlay.style.display = 'none';
        };
    }, 0);
}

function saveDataToLocalStorage(fileID, sheetName, updatedRow) {
    // Lấy dữ liệu hiện có từ localStorage
    const localData = JSON.parse(localStorage.getItem(fileID));

    if (!localData) {
        console.error(`Workbook with fileID ${fileID} does not exist in localStorage.`);
        return;
    }

    // Kiểm tra xem sheet đã tồn tại hay chưa
    if (!localData[sheetName]) {
        console.error(`Sheet with name ${sheetName} does not exist in file ${fileID}.`);
        return;
    }

    // Thêm dòng dữ liệu mới vào sheet
    localData[sheetName].push(updatedRow);

    // Cập nhật lại dữ liệu trong localStorage
    localStorage.setItem(fileID, JSON.stringify(localData));

    console.log(`Data for sheet ${sheetName} in file ${fileID} has been updatedqeq.`);
}

// Hàm cập nhật cột mới vào localStorage
function updateLocalStorageWithNewColumn(fileID, sheetName, filteredColumnNames) {
    const localData = JSON.parse(localStorage.getItem(fileID));

    if (!localData) {
        console.error(`Workbook with fileID ${fileID} does not exist in localStorage.`);
        return;
    }

    if (!localData[sheetName]) {
        console.error(`Sheet with name ${sheetName} does not exist in file ${fileID}.`);
        return;
    }

    // Cập nhật danh sách các cột vào localStorage
    localData[sheetName].columns = filteredColumnNames;
    localStorage.setItem(fileID, JSON.stringify(localData));

    console.log(`Column names for sheet ${sheetName} in file ${fileID} have been updated.`);
}

// Hàm cập nhật bảng HTML khi có thêm cột mới
function updateTableWithNewColumn(fileID, sheetName, newColumnName) {
    // Tìm bảng theo fileID và sheetName
    const sheetContainer = document.querySelector(`.sheet-container[data-file-id="${fileID}"]`);
    const sheetContent = sheetContainer.querySelector('.sheet-content');
    const table = sheetContent.querySelector('.excel-table');

    if (!table) {
        console.error('Không tìm thấy bảng để cập nhật cột mới.');
        return;
    }

    // Lấy hàng tiêu đề hiện tại (tr đầu tiên)
    const headerRow = table.querySelector('tr');

    // Thêm ô tiêu đề mới cho cột mới
    const newHeaderCell = document.createElement('th');
    newHeaderCell.textContent = newColumnName;
    headerRow.appendChild(newHeaderCell); // Thêm ô mới vào hàng tiêu đề

    // Kiểm tra phần tbody
    let tbody = table.querySelector('tbody');
    if (!tbody) {
        // Nếu chưa có tbody, tạo nó và thêm vào bảng
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
    }

    // Cập nhật các dòng dữ liệu trong tbody để thêm ô cho cột mới
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const newCell = document.createElement('td');
        newCell.textContent = ''; // Giá trị mặc định là trống
        row.appendChild(newCell); // Thêm cột mới vào mỗi dòng trong tbody
    });

    // Cập nhật lại dữ liệu vào localStorage (nếu cần)
    let existingData = JSON.parse(localStorage.getItem(fileID)) || {};
    if (!existingData[sheetName]) {
        existingData[sheetName] = [];
    }
    existingData[sheetName].forEach(row => {
        row[newColumnName] = ''; // Thêm cột mới vào mỗi đối tượng row với giá trị trống
    });

    localStorage.setItem(fileID, JSON.stringify(existingData)); // Lưu lại vào localStorage
}

// Hàm xóa dữ liệu từ localStorage khi tải lại trang
window.addEventListener('DOMContentLoaded', function () {
    // Xóa toàn bộ dữ liệu trong localStorage
    localStorage.clear();
    console.log('Toàn bộ dữ liệu đã bị xóa khỏi localStorage.');
});


function calculateColumnWidths(jsonData) {
    const colWidths = [];
    jsonData.forEach(row => {
        row.forEach((cell, index) => {
            const cellLength = cell ? cell.toString().length : 0;
            if (!colWidths[index] || cellLength > colWidths[index]) {
                colWidths[index] = cellLength;
            }
        });
    });
    return colWidths.map(width => width * 100);  // Đoạn mã này nhân với 10 để có độ rộng phù hợp
}