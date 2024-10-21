document.addEventListener('DOMContentLoaded', function () {
    // Khôi phục trạng thái submenu từ localStorage
    const submenuStates = JSON.parse(localStorage.getItem('submenuStates')) || {};

    // Thiết lập trạng thái cho các submenu
    for (const [key, value] of Object.entries(submenuStates)) {
        const toggle = document.getElementById(`toggle-${key}`);
        if (toggle) {
            toggle.checked = value; // Thiết lập checkbox dựa trên trạng thái đã lưu
        }
    }

    // Xử lý sự kiện click cho các liên kết trong submenu
    const submenuLinks = document.querySelectorAll('.submenu a'); // Chọn tất cả các liên kết trong submenu

    submenuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Ngăn chặn hành động mặc định (reload trang)
            e.preventDefault();

            // Khi click vào liên kết, trang sẽ không bị reload, nhưng sẽ điều hướng
            const href = this.getAttribute('data-href');
            if (href) {
                // Điều hướng đến liên kết tương ứng mà không reload trang
                window.location.href = href; // Bạn vẫn có thể reload trang nếu cần
            }
        });
    });

    // Xử lý sự kiện click cho các nút toggle
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function () {
            const key = this.id.replace('toggle-', ''); // Lấy tên của menu từ ID
            submenuStates[key] = this.checked; // Lưu trạng thái vào localStorage
            localStorage.setItem('submenuStates', JSON.stringify(submenuStates)); // Cập nhật localStorage
        });
    });
});
