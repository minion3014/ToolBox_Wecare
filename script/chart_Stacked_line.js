document.getElementById('btn-add-stacked-line-chart').addEventListener('click', function () {
    const dataContainer = document.getElementById('saved-data-container');
    dataContainer.innerHTML = '';  // Xóa nội dung cũ nếu có

    const formContainer = document.createElement('div');
    formContainer.classList.add('form-container');

    const selectFileLabel = document.createElement('label');
    selectFileLabel.textContent = 'Chọn File:';
    const selectFile = document.createElement('select');
    selectFile.classList.add('custom-select');

    const selectTableLabel = document.createElement('label');
    selectTableLabel.textContent = 'Chọn bảng:';
    const selectTable = document.createElement('select');
    selectTable.classList.add('custom-select');

    const selectColumnXLabel = document.createElement('label');
    selectColumnXLabel.textContent = 'Chọn đối tượng:';
    const selectColumnX = document.createElement('select');
    selectColumnX.classList.add('custom-select');

    const selectColumnYLabel = document.createElement('label');
    selectColumnYLabel.textContent = 'Chọn giá trị:';
    const selectColumnY = document.createElement('select');
    selectColumnY.classList.add('custom-select');

    // Thêm phần chọn hàm tính toán
    const selectFunctionLabel = document.createElement('label');
    selectFunctionLabel.textContent = 'Chọn hàm:';
    const selectFunction = document.createElement('select');
    selectFunction.classList.add('custom-select');

    const functions = ['sum', 'count', 'count distinct', 'average', 'min', 'max'];
    functions.forEach(func => {
        const option = document.createElement('option');
        option.value = func;
        option.text = func.toUpperCase();
        selectFunction.appendChild(option);
    });

    const chartButton = document.createElement('button');
    chartButton.textContent = 'Tạo Biểu Đồ';
    chartButton.classList.add('custom-button');

    // Thêm các file bắt đầu bằng 'file_'
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('file_')) {
            const option = document.createElement('option');
            option.value = key;
            option.text = key;
            selectFile.appendChild(option);
        }
    }

    // Khi chọn file, hiển thị các bảng

    const selectedFileKey = selectFile.value;
    const selectedFileData = localStorage.getItem(selectedFileKey);

    if (!selectedFileData) {
        console.error('Không tìm thấy dữ liệu cho file: ', selectedFileKey);
        return;
    }

    const selectedFile = JSON.parse(selectedFileData);

    selectTable.innerHTML = '';  // Xóa nội dung cũ của selectTable
    for (const table in selectedFile) {
        if (selectedFile.hasOwnProperty(table)) {  // Kiểm tra xem table có phải là key hợp lệ
            const option = document.createElement('option');
            option.value = table;
            option.text = table;
            selectTable.appendChild(option);
        }
    }


    // Khi chọn bảng, hiển thị các cột
    selectTable.addEventListener('change', function () {
        const selectedFileKey = selectFile.value;
        const selectedFileData = localStorage.getItem(selectedFileKey);

        if (!selectedFileData) {
            console.error('Không tìm thấy dữ liệu cho file: ', selectedFileKey);
            return;
        }

        const selectedFile = JSON.parse(selectedFileData);
        const selectedTable = selectedFile[selectTable.value];

        selectColumnX.innerHTML = '';
        selectColumnY.innerHTML = '';

        if (selectedTable.length > 0) {
            const columns = Object.keys(selectedTable[0]);
            columns.forEach(column => {
                const optionX = document.createElement('option');
                optionX.value = column;
                optionX.text = column;
                selectColumnX.appendChild(optionX);

                const optionY = document.createElement('option');
                optionY.value = column;
                optionY.text = column;
                selectColumnY.appendChild(optionY);
            });
        }
    });

    // Khi nhấn "Tạo Biểu Đồ"
    chartButton.addEventListener('click', function () {
        const selectedFileKey = selectFile.value;
        const selectedFileData = localStorage.getItem(selectedFileKey);

        if (!selectedFileData) {
            console.error('Không tìm thấy dữ liệu cho file: ', selectedFileKey);
            return;
        }

        const selectedFile = JSON.parse(selectedFileData);
        const selectedTable = selectedFile[selectTable.value];
        const columnX = selectColumnX.value;
        const columnY = selectColumnY.value;
        const selectedFunction = selectFunction.value;

        // Lấy danh sách các giá trị X và Y từ bảng đã chọn
        const labels = [...new Set(selectedTable.map(row => row[columnX]))]; // Loại bỏ các giá trị trùng lặp

        let dataPoints = [];

        // Tính toán giá trị Y theo hàm đã chọn
        if (selectedFunction === 'count') {
            dataPoints = labels.map(label => selectedTable.filter(row => row[columnX] === label).length);
        } else if (selectedFunction === 'sum') {
            dataPoints = labels.map(label => {
                return selectedTable
                    .filter(row => row[columnX] === label)
                    .reduce((sum, row) => sum + parseFloat(row[columnY]), 0);
            });
        } else if (selectedFunction === 'average') {
            dataPoints = labels.map(label => {
                const filteredRows = selectedTable.filter(row => row[columnX] === label);
                const sum = filteredRows.reduce((sum, row) => sum + parseFloat(row[columnY]), 0);
                return sum / filteredRows.length;
            });
        } else if (selectedFunction === 'min') {
            dataPoints = labels.map(label => {
                const filteredRows = selectedTable.filter(row => row[columnX] === label);
                return Math.min(...filteredRows.map(row => parseFloat(row[columnY])));
            });
        } else if (selectedFunction === 'max') {
            dataPoints = labels.map(label => {
                const filteredRows = selectedTable.filter(row => row[columnX] === label);
                return Math.max(...filteredRows.map(row => parseFloat(row[columnY])));
            });
        } else if (selectedFunction === 'count distinct') {
            dataPoints = labels.map(label => {
                const distinctValues = [...new Set(selectedTable
                    .filter(row => row[columnX] === label)
                    .map(row => row[columnY]))];
                return distinctValues.length;
            });
        }

        const data = {
            labels: labels,
            datasets: [{
                label: `${selectedFunction.toUpperCase()} của ${columnY}`,
                data: dataPoints,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        const options = {
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true // Đặt stacked cho biểu đồ line
                },
                x: {
                    stacked: true // Đặt stacked cho trục X
                }
            }
        };

        renderChart('line', data, options);
    });

    // Thêm các phần tử vào giao diện
    formContainer.appendChild(selectFileLabel);
    formContainer.appendChild(selectFile);
    formContainer.appendChild(selectTableLabel);
    formContainer.appendChild(selectTable);
    formContainer.appendChild(selectColumnXLabel);
    formContainer.appendChild(selectColumnX);
    formContainer.appendChild(selectColumnYLabel);
    formContainer.appendChild(selectColumnY);
    formContainer.appendChild(selectFunctionLabel);
    formContainer.appendChild(selectFunction);
    formContainer.appendChild(chartButton);

    dataContainer.appendChild(formContainer);
});