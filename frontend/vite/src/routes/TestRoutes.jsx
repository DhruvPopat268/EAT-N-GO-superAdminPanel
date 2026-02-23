import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

const FileUploadTest = Loadable(lazy(() => import('views/test/FileUploadTest')));

const TestRoutes = {
  path: 'test',
  children: [
    {
      path: 'file-upload',
      element: <FileUploadTest />
    }
  ]
};

export default TestRoutes;
