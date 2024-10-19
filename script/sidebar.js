// sidebar.js

document.addEventListener('DOMContentLoaded', function () {
    const submenuLinks = document.querySelectorAll('.submenu a');  // Chọn tất cả các liên kết trong submenu

    submenuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Ngăn chặn hành động mặc định (reload trang)
            e.preventDefault();

            // Khi click vào liên kết, trang sẽ không bị reload, nhưng sẽ điều hướng
            const href = this.getAttribute('data-href');
            if (href) {
                // Điều hướng đến liên kết tương ứng mà không reload trang
                window.location.href = href;
            }
        });
    });
});
