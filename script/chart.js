
// Tải lại các biểu đồ
window.addEventListener('load', loadSavedCharts);

// Gán sự kiện khi nút Import được nhấn
document.getElementById('btn-import-custom-chart').addEventListener('click', function () {
    document.getElementById('import-file').click(); // Mở cửa sổ chọn file
});

// Xử lý khi người dùng chọn file import
document.getElementById('import-file').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const chartsData = JSON.parse(e.target.result);
                if (Array.isArray(chartsData)) {
                    // Xóa các biểu đồ hiện tại
                    document.getElementById('visualization-display-area').innerHTML = '';

                    // Lưu dữ liệu vào localStorage
                    localStorage.setItem('savedCharts', JSON.stringify(chartsData));

                    // Tạo lại biểu đồ từ dữ liệu đã import
                    chartsData.forEach(chartInfo => {
                        const canvas = createChartContainer(chartInfo.id); // Truyền ID từ dữ liệu import
                        const ctx = canvas.getContext('2d');

                        // Đặt vị trí và kích thước
                        const chartContainer = canvas.parentElement;
                        chartContainer.style.left = chartInfo.position.left;
                        chartContainer.style.top = chartInfo.position.top;
                        chartContainer.style.width = chartInfo.size.width;
                        chartContainer.style.height = chartInfo.size.height;

                        new Chart(ctx, {
                            type: chartInfo.type,
                            data: chartInfo.data,
                            options: chartInfo.options
                        });
                    });
                } else {
                    alert('Dữ liệu không hợp lệ. Vui lòng chọn file JSON chứa các thông tin biểu đồ hợp lệ.');
                }
            } catch (error) {
                alert('Đã có lỗi xảy ra khi đọc file. Vui lòng kiểm tra lại.');
            }
        };
        reader.readAsText(file);
    }
});

// Event listeners cho việc vẽ các loại biểu đồ
document.getElementById('btn-add-text').addEventListener('click', function () {
    createTextInputContainer();
});

// Event listeners cho việc xóa 
document.getElementById('btn-clear-custom-chart').addEventListener('click', function () {
    // Xóa tất cả các chart khỏi localStorage
    localStorage.removeItem("savedCharts");

    // Xóa tất cả các chart khỏi giao diện
    const visualizationDisplayArea = document.getElementById('visualization-display-area');
    while (visualizationDisplayArea.firstChild) {
        visualizationDisplayArea.removeChild(visualizationDisplayArea.firstChild);
    }
});

// Hàm tạo chart và biểu đồ
function createChartContainer(existingId = null) {
    const chartContainer = document.createElement('div');
    chartContainer.classList.add('chart-container');
    chartContainer.style.position = 'absolute'; // Cho phép di chuyển tự do

    // Sử dụng ID truyền vào nếu có, nếu không thì tạo ID mới
    const uniqueId = existingId || `chart-${Date.now()}`;
    chartContainer.setAttribute('data-chart-id', uniqueId);

    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);

    // Tạo và thêm nút xóa vào chart container
    const deleteButton = deleteChartContainer(chartContainer);
    chartContainer.appendChild(deleteButton);

    document.getElementById('visualization-display-area').appendChild(chartContainer);

    // Kéo thả và thay đổi kích thước
    makeDraggable(chartContainer);
    makeResizable(chartContainer);

    return canvas;
}

// Hàm tạo nút xóa cho mỗi biểu đồ
function deleteChartContainer(chartContainer) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.style.position = 'absolute';
    deleteButton.style.top = '5px';
    deleteButton.style.right = '5px';
    deleteButton.style.background = 'rgb(240, 113, 113)';
    deleteButton.style.width = '15px';
    deleteButton.style.border = 'none';
    deleteButton.style.color = 'white';

    // Gọi hàm xóa biểu đồ khi nút xóa được nhấn
    deleteButton.addEventListener('click', function () {
        const uniqueId = chartContainer.getAttribute('data-chart-id');
        chartContainer.remove();
        console.log(uniqueId);
        deleteChartFromLocalStorage(uniqueId); // Xóa biểu đồ khỏi localStorage
    });

    return deleteButton;
}

// Hàm xử lý kéo thả phần tử
function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    // Lấy vùng visualization-display-area
    const displayArea = document.getElementById('visualization-display-area');
    const displayAreaRect = displayArea.getBoundingClientRect();

    element.addEventListener('mousedown', function (e) {
        const rect = element.getBoundingClientRect();
        const isInResizeArea =
            e.clientX >= rect.right - 10 && e.clientX <= rect.right &&
            e.clientY >= rect.bottom - 10 && e.clientY <= rect.bottom;

        if (e.target.tagName === 'CANVAS' || e.target.tagName === 'BUTTON' || isInResizeArea) return;

        isDragging = true;
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Giới hạn vị trí kéo thả trong visualization-display-area
            if (newX < displayAreaRect.left) {
                newX = displayAreaRect.left;
            }
            if (newY < displayAreaRect.top) {
                newY = displayAreaRect.top;
            }
            if (newX + element.offsetWidth > displayAreaRect.right) {
                newX = displayAreaRect.right - element.offsetWidth;
            }
            if (newY + element.offsetHeight > displayAreaRect.bottom) {
                newY = displayAreaRect.bottom - element.offsetHeight;
            }

            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        }
    });

    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';

            // Lưu vị trí vào localStorage
            const uniqueId = element.getAttribute('data-chart-id');
            updateChartPositionInLocalStorage(uniqueId, element.style.left, element.style.top);
        }
    });
}

// Hàm xử lý thay đổi kích thước
function makeResizable(element) {
    const resizer = document.createElement('div');
    resizer.classList.add('resizer');
    resizer.style.width = '10px';
    resizer.style.height = '10px';
    resizer.style.position = 'absolute';
    resizer.style.right = '0';
    resizer.style.bottom = '0';
    resizer.style.cursor = 'se-resize';
    resizer.style.zIndex = '10';
    element.appendChild(resizer);

    resizer.addEventListener('mousedown', function (e) {
        e.preventDefault();
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
        const newWidth = e.clientX - element.getBoundingClientRect().left;
        const newHeight = e.clientY - element.getBoundingClientRect().top;

        // Cập nhật kích thước chỉ khi nó lớn hơn một giá trị tối thiểu
        if (newWidth > 100 && newHeight > 100) {
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;
        }
    }

    function stopResize() {
        // Lưu kích thước vào localStorage
        const uniqueId = element.getAttribute('data-chart-id');
        updateChartSizeInLocalStorage(uniqueId, element.style.width, element.style.height);

        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
    }
}

// Hàm cập nhật vị trí biểu đồ trong localStorage
function updateChartPositionInLocalStorage(chartId, left, top) {
    let savedCharts = localStorage.getItem('savedCharts');
    if (savedCharts) {
        let chartsData = JSON.parse(savedCharts);
        const chart = chartsData.find(chartInfo => chartInfo.id === chartId);
        if (chart) {
            chart.position.left = left;
            chart.position.top = top;
        }
        localStorage.setItem('savedCharts', JSON.stringify(chartsData));
    }
}

// Hàm cập nhật kích thước biểu đồ trong localStorage
function updateChartSizeInLocalStorage(chartId, width, height) {
    let savedCharts = localStorage.getItem('savedCharts');
    if (savedCharts) {
        let chartsData = JSON.parse(savedCharts);
        const chart = chartsData.find(chartInfo => chartInfo.id === chartId);
        if (chart) {
            chart.size.width = width;
            chart.size.height = height;
        }
        localStorage.setItem('savedCharts', JSON.stringify(chartsData));
    }
}

// Hàm vẽ biểu đồ
function renderChart(type, data, options) {
    const canvas = createChartContainer();
    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });

    // Gọi hàm lưu biểu đồ vào localStorage
    saveChartToLocalStorage(canvas.parentElement, type, data, options);
}

// Hàm để lưu các biểu đồ
document.getElementById('btn-save-custom-chart').addEventListener('click', function () {
    const charts = document.querySelectorAll('.chart-container');
    const chartsData = [];

    charts.forEach(chartContainer => {
        const canvas = chartContainer.querySelector('canvas');
        const chartInstance = Chart.getChart(canvas); // Lấy instance của Chart.js từ canvas

        if (chartInstance) {
            const chartInfo = {
                id: chartContainer.getAttribute('data-chart-id'), // Lưu ID duy nhất
                type: chartInstance.config.type,
                data: chartInstance.config.data,
                options: chartInstance.config.options,
                position: {
                    left: chartContainer.style.left,
                    top: chartContainer.style.top,
                },
                size: {
                    width: chartContainer.style.width,
                    height: chartContainer.style.height
                }
            };

            chartsData.push(chartInfo);
        }
    });

    // Lưu dữ liệu vào localStorage hoặc tải xuống dưới dạng file
    const jsonData = JSON.stringify(chartsData);

    // Nếu muốn tải xuống file JSON
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chartsData.json';
    link.click();
});

// Hàm thêm chart vào localStorage
function saveChartToLocalStorage(chartContainer, type, data, options) {
    const uniqueId = chartContainer.getAttribute('data-chart-id');
    const chartInfo = {
        id: uniqueId,
        type: type,
        data: data,
        options: options,
        position: {
            left: chartContainer.style.left,
            top: chartContainer.style.top,
        },
        size: {
            width: chartContainer.style.width,
            height: chartContainer.style.height
        }
    };

    let savedCharts = localStorage.getItem('savedCharts');
    savedCharts = savedCharts ? JSON.parse(savedCharts) : [];
    savedCharts.push(chartInfo);
    localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
}

// Hàm xóa chart khỏi localStorage
function deleteChartFromLocalStorage(chartId) {
    const savedCharts = localStorage.getItem('savedCharts');
    if (savedCharts) {
        let chartsData = JSON.parse(savedCharts);
        chartsData = chartsData.filter(chartInfo => chartInfo.id !== chartId);
        localStorage.setItem('savedCharts', JSON.stringify(chartsData));
    }
}

// Hàm import các biểu đồ từ localStorage hoặc file JSON
function loadSavedCharts() {
    const savedCharts = localStorage.getItem('savedCharts');
    if (savedCharts) {
        const chartsData = JSON.parse(savedCharts);

        chartsData.forEach(chartInfo => {
            const canvas = createChartContainer(chartInfo.id); // Truyền ID đã lưu khi tạo
            const ctx = canvas.getContext('2d');

            // Đặt vị trí và kích thước
            const chartContainer = canvas.parentElement;
            chartContainer.style.left = chartInfo.position.left;
            chartContainer.style.top = chartInfo.position.top;
            chartContainer.style.width = chartInfo.size.width;
            chartContainer.style.height = chartInfo.size.height;

            new Chart(ctx, {
                type: chartInfo.type,
                data: chartInfo.data,
                options: chartInfo.options
            });
        });
    }
}