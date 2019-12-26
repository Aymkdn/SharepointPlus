import people from './people.js'

/**
  @name $SP().whoami
  @function
  @category people
  @description Find the current user's details like manager, email, colleagues, ...

  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
  @return {Promise} resolve(people), reject(error)

  @example
  $SP().whoami({url:"http://my.si.te/subdir/"}).then(function(people) {
    for (var i=0; i &lt; people.length; i++) console.log(people[i]+" = "+people[people[i]]);
  });
*/
export default function whoami(setup) {
  return people.call(this,"",setup);
}
