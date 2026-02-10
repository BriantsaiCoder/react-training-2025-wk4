import Pagination from './Pagination';

function Product_list({ products, openModal, INITIAL_TEMPLATE_DATA, pagination, getData }) {
  return (
    <div className='container'>
      {/* 新增產品按鈕 */}
      <div className='text-end mt-4'>
        <button type='button' className='btn btn-primary' onClick={() => openModal(INITIAL_TEMPLATE_DATA, 'create')}>
          建立新的產品
        </button>
      </div>
      <h2>產品列表</h2>
      <table className='table'>
        <thead>
          <tr>
            <th>分類</th>
            <th>產品名稱</th>
            <th>原價</th>
            <th>售價</th>
            <th>是否啟用</th>
            <th>編輯</th>
          </tr>
        </thead>
        <tbody>
          {products && products.length > 0 ? (
            products.map((item) => (
              <tr key={item.id}>
                <td>{item.category}</td>
                <td>{item.title}</td>
                <td>{item.origin_price}</td>
                <td>{item.price}</td>
                <td className={`${item.is_enabled ? 'text-success' : ''}`}>{item.is_enabled ? '啟用' : '未啟用'}</td>
                <td>
                  <div className='btn-group'>
                    <button
                      type='button'
                      className='btn btn-outline-primary btn-sm'
                      onClick={() => openModal(item, 'edit')}
                    >
                      編輯
                    </button>
                    <button
                      type='button'
                      className='btn btn-outline-danger btn-sm'
                      onClick={() => openModal(item, 'delete')}
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan='6'>尚無產品資料</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination pagination={pagination} changePage={getData} />
    </div>
  );
}
export default Product_list;
