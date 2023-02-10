const Validator = require('jsonschema').Validator;

module.exports = {
    getKanjiFromString: function(string) //Returns a new string with just the kanji from the provided string.
    {
        var regexMatch = string.match(/[\u4E00-\u9FAF]/g); //Kanji Unicode range, U4E00 - U9FAF
        var kanjiString = "";

        if(regexMatch == null) //If there's no kanji in the original string, return undefined.
            { return undefined;}

        regexMatch.forEach(kanji => kanjiString += kanji); //Add each kanji into the new string and return it once done.
        return kanjiString;
    },
    createSortedKanjiList: function(string) //Returns an array of objects, each featuring a kanji and a number of occurences, sorted in ascending order
    {
        var baseCounts = {}; 

        for(index = 0, len = string.length; index < len; ++index) //For each character in the provided string...
        {
            ch = string.charAt(index);
            theCount = baseCounts[ch]; //Get character inside base counts array
            theCount = (theCount == undefined) ? {char: ch, count: 1} : {char: ch, count: theCount.count+1}; /*If character is undefined inside array, create it.
                                                                                                             If not, increment count.*/
            baseCounts[ch] = theCount; //Set character inside the base counts array
        }
    
        var counts = Object.values(baseCounts); //New counts array that allows incrementing

        for(let i = 0; i < counts.length; i++) //Bubble sort in descending order
        {
            for(let j = 0; j < counts.length - i - 1; j++)
            {
                if(counts[j + 1].count < counts[j].count)
                {
                    [counts[j+1],counts[j]] = [counts[j], counts[j+1]];
                }
            }
        }
    
        return counts.reverse() //Return reverse of the sort
    },
    validateJsonAgainstSchema: function(data, schema)
    {
        var validator = new Validator();
        try {
            validator.validate(data, schema, {throwFirst: true})
            return true;
        } catch (error) {
            return false;
        }
    }
}