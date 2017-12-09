/*
* @Author: tengmaoqing
* @Date:   2017-12-05 20:02:13
* @Last Modified by:   tengmaoqing
* @Last Modified time: 2017-12-08 14:22:42
*/

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const http = require("http");
const request = require('request-promise-native');

const readXLSL = (filename) => {

  const buf = fs.readFileSync(filename);
  const workbook = XLSX.read(buf, {type:'buffer'});
  const sheetNames = workbook.SheetNames; // 返回 ['sheet1', 'sheet2',……]
  const worksheet = workbook.Sheets[sheetNames[0]];// 获取excel的第一个表格
  let ref = worksheet['!ref']; //获取excel的有效范围,比如A1:F20
  const reg = /[a-zA-Z]/g;
  ref = ref.replace(reg,"");
  const line = parseInt(ref.split(':')[1]); // 获取excel的有效行数
  return {
    worksheet,
    line
  };

};

const outputExcl = () => {
  // const wbObj = readXLSL(path.join(__dirname, '../public/spu.xlsx'));

  const buf = fs.readFileSync(path.join(__dirname, '../public/spu.xlsx'));
  const workbook = XLSX.read(buf, {type:'buffer'});
  const sheetNames = workbook.SheetNames; // 返回 ['sheet1', 'sheet2',……]
  const worksheet = workbook.Sheets[sheetNames[0]];// 获取excel的第一个表格
  let ref = worksheet['!ref']; //获取excel的有效范围,比如A1:F20
  const reg = /[a-zA-Z]/g;
  ref = ref.replace(reg,"");
  const line = parseInt(ref.split(':')[1]); // 获取excel的有效行数
  let imgMap = fs.readFileSync(path.join(__dirname, '../public/imgMap.json'));
  imgMap = imgMap ? JSON.parse(imgMap) : {};
  const failList = [];

  for (let i = 2; i <= line; i++) {
    let imgUrl = worksheet[`A${i}`];
    if (!imgUrl) {
      continue;
    }
    imgUrl = imgUrl.v;

    if (worksheet[`G${i}`]) {
      continue;
    }

    // const newName = imgUrl.split('.').shift();
    const newName = imgUrl;
    // splitedNameArray.pop();
    // const newName = splitedNameArray.join('.');

    const aliUrl = imgMap[newName];
    if (!aliUrl) {
      failList.push(`G${i}`);
      continue;
    }
    // const imgId = worksheet[`A${i}`];
    let si = i + '';
    worksheet[`G${i}`] = { t: 's', v: aliUrl, r: `<t>${aliUrl}</t>`, h: aliUrl, w: aliUrl };
  }

  console.log(failList);
  worksheet['!ref'] = `A1:O${line}`;
  XLSX.writeFile(workbook, path.join(__dirname, '../public/spu_new.xlsx'))
}

const exitFiles = [];
const copyImg = (url) => {
  const basename = path.basename(url);

  return new Promise((resolve, reject) => {
    const sourceFile = path.join(__dirname, `../public/phone/${basename}`);
    const destPath = path.join(__dirname, `../public/copyImg/${basename}`);

    if (fs.existsSync(sourceFile)) {
      let readStream = fs.createReadStream(sourceFile);
      let writeStream = fs.createWriteStream(destPath);
      readStream.pipe(writeStream);

      readStream.on('end', function () {
        resolve();
      });

      readStream.on('error', function(err) {
        console.log('失败了!继续!');
        exitFiles.push(basename);
        resolve();
      });
    } else {
      resolve();
      exitFiles.push(basename);
    }
  });
  // return request.head(url).catch(err => {
  //   if (err) {
  //     // console.log(err);
  //     return;
  //   }
  // }).then(res => {
  //   console.log()
  //   request(url).pipe(fs.createWriteStream(path.join(__dirname, `../public/downImg/${basename}`)));
  // });

};

const downloadImg = (url) => {
  const basename = path.basename(url);
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let imgData = "";
      res.setEncoding("binary");
      res.on("data", function(chunk){
          imgData += chunk;
      });

      res.on("end", function(){
        fs.writeFile(path.join(__dirname, `../public/downImg/${basename}`), imgData, "binary", function(err){
          if(err){
            console.log("down fail");
            reject(err);
            return;
          }
          resolve();
        });
      });

      res.on('error', function (err) {
        console.log("down fail");
        reject(err);
      })
    })
  });
}

// const getBrandsByClassId = (classid) => {

//   return request.get(`http://mobile.huishoubao.com/common/product/brands?pid=1257&classId=${classid}`).then(res => {
//     res = JSON.parse(res);
//     if (res.errcode !== 0) {
//       Promise.reject('接口异常');
//       return;
//     }
//     return res.data;
//   });
// }

// const getProductByBrandId = (classId, brandId) => {
//   return request.get(`http://mobile.huishoubao.com/common/product/products?pid=1257&classId=${classId}&brandId=${brandId}&pageSize=500`).then(res => {
//     res = JSON.parse(res);
//     if (res.errcode !== 0) {
//       Promise.reject('接口异常');
//       return;
//     }
//     return res.data;
//   });
// }

// getProductByBrandId(1, 7).then(res => console.log(res.length));

const downAllProdunctsImg = async function() {
  let allFilesCount = 0;
  // let brandsCount = 0;
  // let noImgs = 0;
  let realProductsCount = 0;
  let wtBrandIds = [];
  // for (let classid of [1, 3]) {
  //   const brandInfo = await getBrandsByClassId(classid);
  //   const brands = brandInfo.brandlist;
  //   brandsCount += Number(brandInfo.brandcount);
  //   for (let brand of brands) {
  //     const brandid = brand.brandid;
  //     if (brandid === '-1') {
  //       continue;
  //     }
  //     // console.log('brandid is ${brandid}');
  //     const productsInfo = await getProductByBrandId(classid, brandid);
  //     const productlist = productsInfo.productlist;
  //     productsCount += Number(productsInfo.pdtcount);
  //     realProductsCount += productlist.length;

  //     if (Number(productsInfo.pdtcount) !== productlist.length) {
  //       wtBrandIds.push(brandid);
  //     }

  let productInfo = fs.readFileSync(path.join(__dirname, '../public/products.txt'));
  productInfo = JSON.parse(productInfo);
  const productlist = productInfo.map(item => {
    const temp = item.split('|');
    return {
      productid: temp[0],
      productlogo: temp[2],
    }
  });

  for (let product of productlist) {
    if (!product.productlogo) {
      wtBrandIds.push(product);
      continue;
    }
    // console.log(`brandid is ${brandid} | productid is ${product.productid}`);
    allFilesCount++;
    let result = await copyImg(`http://s1.huishoubao.com/img/phone/${product.productlogo}`);
    // console.log(`${product.productid} downLoad success!`);
  }
    // }
  // }
  console.log(`移动完成，总共获取复制图片${allFilesCount}， 总共失败${exitFiles.length}，开始下载!`);
  // console.log(`总共品牌 ${brandsCount}, 总共机型 ${productsCount}, 实际机型${realProductsCount}`);
  console.log(`问题品牌 ${JSON.stringify(wtBrandIds)}`);
  fs.writeFile(path.join(__dirname, '../public/err.log'), JSON.stringify(exitFiles), 'utf-8', function(err) {
    if (err) {
      console.log('记录失败');
      return;
    }
    console.log('记录完成');
  });
  for (let basename of exitFiles) {
    await downloadImg(`http://s1.huishoubao.com/img/phone/${basename}`);
  }
  console.log('下载完成!');
}

const imgMapTransformat = () => {
  let evalutImgs = '';
  let productImgs = fs.readFileSync(path.join(__dirname, '../public/temp.json'));

  evalutImgs = evalutImgs ? JSON.parse(evalutImgs) : {};
  productImgs = productImgs ? JSON.parse(productImgs) : {};

  const allImgs = Object.assign({}, evalutImgs, productImgs);
  const outPutDate = {};
  Object.keys(allImgs).forEach(imgname => {
    const splitedNameArray = imgname.split('.');
    splitedNameArray.pop();
    const newName = splitedNameArray.join('.');
    outPutDate[newName] = allImgs[imgname];
  });

  fs.writeFile(path.join(__dirname, '../public/imgMap.json'), JSON.stringify(outPutDate, null, 2), 'utf-8', function(err) {
    if (err) {
      console.log('输出失败');
      return;
    }
    console.log('输出成功!');
  });

}

// imgMapTransformat();
// downAllProdunctsImg().catch(err => {
//   console.log(err);
// });
outputExcl();
// readXLSL(path.join(__dirname, '../public/spu.xlsx'));
// copyImg('http://s1.huishoubao.com/img/phone/1.jpg')
// exports.readXLSL = readXLSL;
