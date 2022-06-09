import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _indexOfInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/index-of";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import getURL from '../utils/getURL.js';
import usergroups from './usergroups.js';
import groupMembers from './groupMembers.js';
import distributionLists from './distributionLists.js';
/**
  @name $SP().isMember
  @function
  @category people
  @description Find if the user is member of the Sharepoint group

  @param {Object} [setup] Options (see below)
    @param {String} setup.user Username with domain ("domain\\login" for Sharepoint 2010, or e.g. "i:0#.w|domain\\login" for Sharepoint 2013)
    @param {String} setup.group Name of the group
    @param {String} [setup.url='current website'] The website url
    @param {Boolean} [setup.cache=true] Cache the response from the server
  @return {PRomise} resolve(isMember), reject(error)

  @example
  $SP().isMember({user:"mydomain\\john_doe",group:"my group",url:"http://my.site.com/"}).then(function(isMember) {
    if (isMember) alert("OK !")
  });
*/

export default function isMember(_x) {
  return _isMember.apply(this, arguments);
}

function _isMember() {
  _isMember = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(setup) {
    var members, groups, i, m, _i, distrib, _i2;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            setup = setup || {};

            if (setup.user) {
              _context.next = 4;
              break;
            }

            throw "[SharepointPlus 'isMember'] the user is required.";

          case 4:
            if (setup.group) {
              _context.next = 6;
              break;
            }

            throw "[SharepointPlus 'isMember'] the group is required.";

          case 6:
            setup.cache = setup.cache === false ? false : true;

            if (setup.url) {
              _context.next = 11;
              break;
            }

            _context.next = 10;
            return getURL.call(this);

          case 10:
            setup.url = _context.sent;

          case 11:
            setup.group = setup.group.toLowerCase();
            members = []; // first check with usergroups()

            _context.next = 15;
            return usergroups.call(this, setup.user, {
              cache: setup.cache,
              url: setup.url
            });

          case 15:
            groups = _context.sent;
            i = groups.length;

          case 17:
            if (!i--) {
              _context.next = 22;
              break;
            }

            if (!(groups[i].toLowerCase() === setup.group)) {
              _context.next = 20;
              break;
            }

            return _context.abrupt("return", _Promise.resolve(true));

          case 20:
            _context.next = 17;
            break;

          case 22:
            _context.next = 24;
            return groupMembers.call(this, setup.group, {
              cache: setup.cache,
              url: setup.url
            });

          case 24:
            m = _context.sent;

            for (_i = m.length; _i--;) {
              members.push(m[_i].Name.toLowerCase());
            } // and search if our user is part of the members (like a distribution list)


            _context.next = 28;
            return distributionLists.call(this, setup.user, {
              cache: setup.cache,
              url: setup.url
            });

          case 28:
            distrib = _context.sent;
            _i2 = distrib.length;

          case 30:
            if (!_i2--) {
              _context.next = 35;
              break;
            }

            if (!(_indexOfInstanceProperty(members).call(members, distrib[_i2].DisplayName.toLowerCase()) > -1)) {
              _context.next = 33;
              break;
            }

            return _context.abrupt("return", _Promise.resolve(true));

          case 33:
            _context.next = 30;
            break;

          case 35:
            return _context.abrupt("return", _Promise.resolve(false));

          case 38:
            _context.prev = 38;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _Promise.reject(_context.t0));

          case 41:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 38]]);
  }));
  return _isMember.apply(this, arguments);
}