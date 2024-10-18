// tool_excel.js

document.addEventListener('DOMContentLoaded', function() {
    // Lấy phần tử input file
    const inputElement = document.getElementById('input-excel');
    if (inputElement) {
        // Lắng nghe sự kiện thay đổi
        inputElement.addEventListener('change', handleFile, false);
    } else {
        console.error('Không tìm thấy phần tử với ID "input-excel"');
    }
});

function handleFile(e) {
    const file = e.target.files[0];
    if (!file) {
        alert('Vui lòng chọn một tệp Excel.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Lấy tên các sheet trong tệp Excel
        const sheetNames = workbook.SheetNames;
        const excelDataDiv = document.getElementById('excel-data');
        excelDataDiv.innerHTML = ''; // Xóa nội dung cũ

        sheetNames.forEach(function(sheetName) {
            const sheetContainer = document.createElement('div');
            sheetContainer.classList.add('sheet-container');

            const sheetHeader = document.createElement('div');
            sheetHeader.classList.add('sheet-header');

            const sheetTitle = document.createElement('h2');
            sheetTitle.textContent = 'Sheet: ' + sheetName;

            const toggleButton = document.createElement('button');
            toggleButton.classList.add('toggle-button');
            toggleButton.innerHTML = '<i class="fas fa-plus"></i>';

            toggleButton.addEventListener('click', function() {
                if (sheetContent.style.display === 'none') {
                    sheetContent.style.display = 'block';
                    toggleButton.innerHTML = '<i class="fas fa-minus"></i>';
                } else {
                    sheetContent.style.display = 'none';
                    toggleButton.innerHTML = '<i class="fas fa-plus"></i>';
                }
            });

            sheetHeader.appendChild(sheetTitle);
            sheetHeader.appendChild(toggleButton);
            sheetContainer.appendChild(sheetHeader);

            const sheetContent = document.createElement('div');
            sheetContent.classList.add('sheet-content');
            sheetContent.style.display = 'none';

            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                const noDataMsg = document.createElement('p');
                noDataMsg.textContent = 'Sheet này không có dữ liệu.';
                sheetContent.appendChild(noDataMsg);
            } else {
                const table = document.createElement('table');
                table.classList.add('excel-table');
                const tbody = document.createElement('tbody');

                if (jsonData[0]) {
                    const headerRow = document.createElement('tr');
                    jsonData[0].forEach(function(cellData) {
                        const th = document.createElement('th');
                        th.textContent = cellData !== undefined ? cellData : '';
                        headerRow.appendChild(th);
                    });
                    table.appendChild(headerRow);
                }

                for (let i = 1; i < jsonData.length; i++) {
                    const rowData = jsonData[i];
                    const row = document.createElement('tr');
                    rowData.forEach(function(cellData) {
                        const td = document.createElement('td');
                        td.textContent = cellData !== undefined ? cellData : '';
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                }

                table.appendChild(tbody);
                sheetContent.appendChild(table);
            }

            sheetContainer.appendChild(sheetContent);
            excelDataDiv.appendChild(sheetContainer);
        });
    };

    reader.onerror = function(ex) {
        console.error('Error reading file', ex);
        alert('Đã xảy ra lỗi khi đọc tệp.');
    };

    reader.readAsBinaryString(file);
}