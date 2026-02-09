import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as bootstrap from 'bootstrap';
import './assets/style.css';
import ProductModal from './Components/ProductModal';
import Pagination from './Components/Pagination';
// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
const INITIAL_TEMPLATE_DATA = {
  id: '',
  title: '',
  category: '',
  origin_price: '',
  price: '',
  unit: '',
  description: '',
  content: '',
  is_enabled: false,
  imageUrl: '',
  imagesUrl: [],
};
function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);
  // Modal 控制相關狀態
  const productModalRef = useRef(null);
  const [modalType, setModalType] = useState(''); // "create", "edit", "delete"
  const [pagination, setPagination] = useState({});
  // 產品表單資料模板
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData, // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
  };
  // 表單輸入處理
  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplateData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 圖片處理
  const handleImageChange = (index, value) => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages[index] = value;

      // 填寫最後一個空輸入框時，自動新增空白輸入框
      if (value !== '' && index === newImages.length - 1 && newImages.length < 5) {
        newImages.push('');
      }

      // 清空輸入框時，移除最後的空白輸入框
      if (value === '' && newImages.length > 1 && newImages[newImages.length - 1] === '') {
        newImages.pop();
      }

      return { ...prevData, imagesUrl: newImages };
    });
  };

  // 新增圖片
  const handleAddImage = () => {
    setTemplateData((prevData) => ({
      ...prevData,
      imagesUrl: [...prevData.imagesUrl, ''],
    }));
  };

  // 移除圖片
  const handleRemoveImage = () => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.pop();
      return { ...prevData, imagesUrl: newImages };
    });
  };

  // 表單提交處理
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      // 設定 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;

      // 設定 axios 預設標頭
      axios.defaults.headers.common['Authorization'] = token;
      // 登入成功，設定 isAuth 為 true
      setIsAuth(true);
      // 取得產品資料
      getData();
    } catch (error) {
      console.error('登入失敗:', error.response);
      setIsAuth(false);
      return;
    }
  };
  // 檢查登入狀態
  const checkLogin = async () => {
    try {
      // 驗證 Token 是否有效
      const res = await axios.post(`${API_BASE}/api/user/check`);
      const { success } = res.data;
      console.log('Token 驗證結果：', success);
      setIsAuth(true);
      // 取得產品資料
      getData();
    } catch (error) {
      console.error('Token 驗證失敗：', error.response?.data);
      setIsAuth(false);
    }
  };
  // 取得產品資料
  const getData = async (page = 1) => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`);
      // console.log('產品資料：', response.data);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('取得產品失敗：', err.response?.data?.message);
    }
  };

  // 新增/更新產品
  const updateProductData = async (id) => {
    // 決定 API 端點和方法
    let url;
    let method;

    if (modalType === 'edit') {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = 'put';
    } else if (modalType === 'create') {
      url = `${API_BASE}/api/${API_PATH}/admin/product`;
      method = 'post';
    }

    // 準備要送出的資料（注意格式！）
    const productData = {
      data: {
        ...templateData,
        origin_price: Number(templateData.origin_price), // 轉換為數字
        price: Number(templateData.price), // 轉換為數字
        is_enabled: templateData.is_enabled ? 1 : 0, // 轉換為數字
        imagesUrl: templateData.imagesUrl.filter((url) => url !== ''), // 過濾空白
      },
    };

    try {
      let response;
      if (method === 'put') {
        response = await axios.put(url, productData);
        console.log('產品更新成功：', response.data);
        // alert('產品更新成功！');
      } else {
        response = await axios.post(url, productData);
        console.log('產品新增成功：', response.data);
        // alert('產品新增成功！');
      }

      // 關閉 Modal 並重新載入資料
      closeModal();
      getData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error(`${modalType === 'edit' ? '更新' : '新增'}失敗：`, errorMsg);
      alert(`${modalType === 'edit' ? '更新' : '新增'}失敗：${errorMsg}`);
    }
  };
  // 刪除產品
  const deleteProductData = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      console.log('產品刪除成功：', response.data);
      // alert('產品刪除成功！');

      // 關閉 Modal 並重新載入資料
      closeModal();
      getData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error('刪除失敗：', errorMsg);
    }
  };
  useEffect(() => {
    // 從 Cookie 取得 Token
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('hexToken='))
      ?.split('=')[1];

    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false,
    });

    // Modal 關閉時移除焦點
    document.querySelector('#productModal').addEventListener('hide.bs.modal', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    checkLogin();
  }, []);
  // 使用 ref 控制 Modal
  // 開啟 Modal 函式
  const openModal = (product, type) => {
    setTemplateData((prevData) => ({
      ...prevData,
      ...product,
    }));

    // 設定 Modal 類型並顯示
    setModalType(type);
    productModalRef.current.show();
  };

  // 關閉 Modal 函式
  const closeModal = () => {
    productModalRef.current.hide();
  };
  return (
    <>
      {!isAuth ? (
        // 登入表單畫面
        <div className='container login'>
          <div className='row justify-content-center'>
            <h1 className='h3 mb-3 font-weight-normal'>請先登入</h1>
            <div className='col-8'>
              <form id='form' className='form-signin' onSubmit={(e) => handleSubmit(e)}>
                <div className='form-floating mb-3'>
                  <input
                    type='email'
                    className='form-control'
                    name='username'
                    placeholder='name@example.com'
                    value={formData.username}
                    onChange={(e) => handleInputChange(e)}
                    required
                    autoFocus
                  />
                  <label htmlFor='username'>Email address</label>
                </div>
                <div className='form-floating'>
                  <input
                    type='password'
                    className='form-control'
                    name='password'
                    placeholder='Password'
                    value={formData.password}
                    onChange={(e) => handleInputChange(e)}
                    required
                  />
                  <label htmlFor='password'>Password</label>
                </div>
                <button className='btn btn-lg btn-primary w-100 mt-3' type='submit'>
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className='mt-5 mb-3 text-muted'>&copy; 2024~∞ - 六角學院</p>
        </div>
      ) : (
        // 登入後的產品管理頁面 (同第一週)
        <div className='container'>
          {/* 新增產品按鈕 */}
          <div className='text-end mt-4'>
            <button
              type='button'
              className='btn btn-primary'
              onClick={() => openModal(INITIAL_TEMPLATE_DATA, 'create')}
            >
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
                    <td className={`${item.is_enabled ? 'text-success' : ''}`}>
                      {item.is_enabled ? '啟用' : '未啟用'}
                    </td>
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
                  <td colSpan='5'>尚無產品資料</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination pagination={pagination} changePage={getData} />
        </div>
      )}
      <ProductModal
        modalType={modalType}
        templateData={templateData}
        handleModalInputChange={handleModalInputChange}
        handleImageChange={handleImageChange}
        handleAddImage={handleAddImage}
        handleRemoveImage={handleRemoveImage}
        deleteProductData={deleteProductData}
        updateProductData={updateProductData}
        closeModal={closeModal}
      />
    </>
  );
}
export default App;
