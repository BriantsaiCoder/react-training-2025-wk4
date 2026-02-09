function Pagination({ pagination, changePage }) {
  const handleClick = (event, page) => {
    event.preventDefault();
    changePage(page);
  };

  return (
    <nav aria-label='Page navigation example'>
      <ul className='pagination justify-content-center'>
        <li className={`page-item ${pagination.has_pre ? '' : 'disabled'}`}>
          <a
            className='page-link'
            href='#'
            aria-label='Previous'
            onClick={(event) => handleClick(event, pagination.current_page - 1)}
          >
            <span aria-hidden='true'>&laquo;</span>
          </a>
        </li>
        {
          // Array.from() 讀取 length 屬性
          // 這裡的 _ 代表陣列元素（我們不使用它）
          Array.from({ length: pagination.total_pages }, (_, i) => (
            <li className='page-item' key={`${i}_page`}>
              <a
                className={`page-link ${i + 1 === pagination.current_page && 'active'}`}
                href='#'
                onClick={(event) => handleClick(event, i + 1)}
              >
                {i + 1}
              </a>
            </li>
          ))
        }
        <li className={`page-item ${pagination.has_next ? '' : 'disabled'}`}>
          <a
            className='page-link'
            href='#'
            aria-label='Next'
            onClick={(event) => handleClick(event, pagination.current_page + 1)}
          >
            <span aria-hidden='true'>&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
export default Pagination;
