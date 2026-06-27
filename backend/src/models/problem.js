const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true,
    },
    tags:{
        // Primary category. Historically limited to array/linkedList/graph/dp,
        // now a free string so imported problems can carry richer categories.
        type:String,
        required:true
    },

    // --- Source / type (builtin solvable vs imported interview catalog) ---
    source:{
        type:String,
        enum:['builtin','interview'],
        default:'builtin'
    },
    // 'solvable' = has test cases & runs in-app; 'catalog' = statement + external link only
    problemType:{
        type:String,
        enum:['solvable','catalog'],
        default:'solvable'
    },
    leetcodeLink:{
        type:String,
    },
    slug:{
        type:String,
        index:true,
    },
    // Full list of LeetCode topics (e.g. ["Array","Hash Table"])
    topics:[{ type:String }],
    // Companies that asked this problem, with frequency + recency buckets
    companies:[
        {
            name:{ type:String, required:true },
            freq:{ type:Number, default:0 },
            recency:[{ type:String }],
            _id:false
        }
    ],
    // Max interview frequency (0-100) and LeetCode acceptance rate (0-1)
    frequency:{ type:Number, default:0 },
    acceptance:{ type:Number, default:null },
    // Denormalized count of companies (for fast list sorting without $size)
    companyCount:{ type:Number, default:0 },
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],

    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            }
        }
    ],

    startCode: [
        {
            language:{
                type:String,
                required:true,
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],

    referenceSolution:[
        {
            language:{
                type:String,
                required:true,
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],

    problemCreator:{
        type: Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
})


problemSchema.index({ 'companies.name': 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ problemType: 1 });

const Problem = mongoose.model('problem',problemSchema);

module.exports = Problem;


