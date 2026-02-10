function Login({ formData, handleInputChange, handleSubmit }) {
  return (
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
  );
}
export default Login;
