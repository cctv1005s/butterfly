'use strict';

import $ from 'jquery';

import './toolTip.less';


const DEFUALT = {
  TEMPLATE:
    '<div class="butterfly-tooltip-container"><div class="butterfly-tooltip-arrow"></div><div class="butterfly-tooltip-inner"></div></div>',
  $viewAppend: 'body',
  $viewCon: {
    tips: '.butterfly-tips',
    menu: '.butterfly-menu',
    common: '.butterfly-tooltip-container'
  },
  $inner: '.butterfly-tooltip-inner'
};

const _toFixed_3 = (num) => {
  if (!num) {
    return 0;
  }
  if (Number(num)) {
    return Number(parseFloat(num).toFixed(3));
  }
};

const _getTipOffset = (placement, pos) => {
  const _pos = {};
  let { left, top, width, height, actualWidth, actualHeight } = pos;
  left = _toFixed_3(left);
  top = _toFixed_3(top);
  width = _toFixed_3(width);
  height = _toFixed_3(height);
  actualWidth = _toFixed_3(actualWidth);
  actualHeight = _toFixed_3(actualHeight);

  switch (placement) {
    case 'top':
      _pos.left = left + width / 2 - actualWidth / 2;
      _pos.top = top - actualHeight - 5;
      break;
    case 'left':
      _pos.left = left - actualWidth - 5;
      _pos.top = top + height / 2 - actualHeight / 2;
      break;
    case 'right':
      _pos.left = left + width + 5;
      _pos.top = top + height / 2 - actualHeight / 2;
      break;
    case 'bottom':
      _pos.left = left + width / 2 - actualWidth / 2;
      _pos.top = top + height + 5;
      break;
    default:
      _pos.left = left + width / 2 - actualWidth / 2;
      _pos.top = top - height - 5;
  }
  return _pos;
};

const show = (opts, type, tipsDom, targetDom, callback) => {
  $(DEFUALT.$viewCon[type]).remove();

  let tipsContainer = $(DEFUALT.TEMPLATE);
  tipsContainer.find(DEFUALT.$inner).append(tipsDom);
  $(tipsContainer).appendTo(DEFUALT.$viewAppend);

  let placement = opts.placement || 'top';

  $(tipsContainer)
    .addClass(DEFUALT.$viewCon[type].replace('.', ''))
    .addClass(placement)
    .addClass('in'); // todo in的动画
  if (opts.className) {
    tipsContainer.addClass(opts.className);
  }

  const pos = {
    top: $(targetDom).offset().top,
    left: $(targetDom).offset().left,
    width: $(targetDom).outerWidth(),
    height: $(targetDom).outerHeight(),
    actualWidth: $(tipsContainer).outerWidth(),
    actualHeight: $(tipsContainer).outerHeight()
  };

  let posInit = {}
  if (opts.x || opts.x === 0) {
    posInit = {
      left: opts.x,
      top: opts.y
    }
  } else {
    posInit = _getTipOffset(placement, pos);
  }

  const position = `top: ${posInit.top}px; left: ${posInit.left}px;`;
  $(tipsContainer).attr('style', position);
  callback && callback(tipsContainer[0]);
  return tipsContainer[0];
}

const hide = (tipsDom, callback) => {
  $(tipsDom).removeClass('in').remove();
  callback && callback(tipsDom);
};

let createTip = (opts, callback) => {
  let currentTips = null;
  let {data, targetDom, genTipDom} = opts;
  targetDom.addEventListener('mouseover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    let tipstDom = genTipDom(data);
    currentTips = show(opts, 'tips', tipstDom, targetDom, callback);
  });

  targetDom.addEventListener('mouseout', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hide(currentTips);
  });
};

let currentMenu = null;
let _hideMenu = (e) => {
  if (e.target === currentMenu || $(currentMenu).find(e.target).length > 0) {
    return ;
  }
  currentMenu && hide(currentMenu);
  document.removeEventListener('click', _hideMenu);
}
let createMenu = (opts, callback) => {
  let {data, targetDom, genTipDom} = opts;
  let _createMenu = () => {
    let tipstDom = genTipDom(data);
    currentMenu = show(opts, 'menu', tipstDom, targetDom, callback);
    if (opts.closable) {
      document.addEventListener('click', _hideMenu);
    }
  }
  if (opts.action === 'click') {
    targetDom.addEventListener('click', _createMenu);
  } else {
    _createMenu();
  }
}

let closeMenu = (callback) => {
  hide(currentMenu, callback);
  document.removeEventListener('click', _hideMenu);
}

export default {
  createTip,
  createMenu,
  closeMenu
};