import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

const VALID_TAGS = ['array', 'linkedList', 'graph', 'dp'];

/** Normalize imported JSON to form shape. Tags must be one of VALID_TAGS. */
function normalizeImportedProblem(json) {
  let tags = (json.tags || 'array').toString().trim();
  const firstWord = tags.split(/[\s,]+/)[0]?.toLowerCase();
  if (VALID_TAGS.includes(firstWord)) tags = firstWord;
  else tags = 'array';

  const visibleTestCases = (json.visibleTestCases || []).map((tc) => ({
    input: tc.input ?? '',
    output: tc.output ?? '',
    explanation: tc.explanation ?? ''
  }));

  const hiddenTestCases = (json.hiddenTestCases || []).map((tc) => ({
    input: tc.input ?? '',
    output: tc.output ?? ''
  }));

  const startCode = (json.startCode || []).slice(0, 3);
  while (startCode.length < 3) {
    const lang = ['C++', 'Java', 'JavaScript'][startCode.length];
    startCode.push({ language: lang, initialCode: '' });
  }
  const refSol = (json.referenceSolution || []).slice(0, 3);
  while (refSol.length < 3) {
    const lang = ['C++', 'Java', 'JavaScript'][refSol.length];
    refSol.push({ language: lang, completeCode: '' });
  }

  let description = json.description ?? '';
  if (json.constraints && Array.isArray(json.constraints) && json.constraints.length > 0) {
    description += '\n\n**Constraints:**\n' + json.constraints.map((c) => '- ' + c).join('\n');
  }

  return {
    title: json.title ?? '',
    description,
    difficulty: ['easy', 'medium', 'hard'].includes(json.difficulty) ? json.difficulty : 'easy',
    tags,
    visibleTestCases: visibleTestCases.length ? visibleTestCases : [{ input: '', output: '', explanation: '' }],
    hiddenTestCases: hiddenTestCases.length ? hiddenTestCases : [{ input: '', output: '' }],
    startCode,
    referenceSolution: refSol
  };
}

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [skipReferenceValidation, setSkipReferenceValidation] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
    replace: replaceVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
    replace: replaceHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const handleImportJson = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJson);
      const data = normalizeImportedProblem(parsed);
      setValue('title', data.title);
      setValue('description', data.description);
      setValue('difficulty', data.difficulty);
      setValue('tags', data.tags);
      replaceVisible(data.visibleTestCases);
      replaceHidden(data.hiddenTestCases);
      setValue('startCode', data.startCode);
      setValue('referenceSolution', data.referenceSolution);
      setImportJson('');
    } catch (e) {
      setImportError(e.message || 'Invalid JSON');
    }
  };

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', {
        ...data,
        skipReferenceValidation: !!skipReferenceValidation
      });
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      const res = error.response;
      const status = res?.status;
      let message = error.message;
      if (res?.data) {
        if (typeof res.data === 'string') message = res.data;
        else message = res.data.message || res.data.error || JSON.stringify(res.data);
      }
      if (status === 401) message = 'Session expired or you are not authorized. Please log in again as admin.';
      alert(`Error${status ? ` (${status})` : ''}: ${message}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>

      {/* Import from JSON */}
      <div className="card bg-base-100 shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Import from JSON</h2>
        <p className="text-sm text-base-content/70 mb-2">Paste a problem JSON below to fill the form. Tags like &quot;array, searching&quot; are normalized to a single valid tag (e.g. array).</p>
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-3 font-medium">Required format: test <strong>input</strong> must be plain text for stdin (e.g. first line: n, second: space-separated numbers, third: target). <strong>Reference solution</strong> must be a full program with <code>main()</code> / <code>readFileSync(0)</code> that reads stdin and prints the result. Use the sample at <code>/linear-search-problem.json</code> as reference.</p>
        <textarea
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder='{"title": "Linear Search", "description": "...", ...}'
          className="textarea textarea-bordered w-full font-mono text-sm min-h-[120px]"
        />
        {importError && <p className="text-error text-sm mt-2">{importError}</p>}
        <button type="button" onClick={handleImportJson} className="btn btn-primary btn-sm mt-3">
          Load into form
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                {...register('title')}
                className={`input input-bordered ${errors.title && 'input-error'}`}
              />
              {errors.title && (
                <span className="text-error">{errors.title.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                {...register('description')}
                className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`}
              />
              {errors.description && (
                <span className="text-error">{errors.description.message}</span>
              )}
            </div>

            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Difficulty</span>
                </label>
                <select
                  {...register('difficulty')}
                  className={`select select-bordered ${errors.difficulty && 'select-error'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Tag</span>
                </label>
                <select
                  {...register('tags')}
                  className={`select select-bordered ${errors.tags && 'select-error'}`}
                >
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          
          {/* Visible Test Cases */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Visible Test Cases</h3>
              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="btn btn-sm btn-primary"
              >
                Add Visible Case
              </button>
            </div>
            
            {visibleFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVisible(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
                
                <input
                  {...register(`visibleTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />
                
                <input
                  {...register(`visibleTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
                
                <textarea
                  {...register(`visibleTestCases.${index}.explanation`)}
                  placeholder="Explanation"
                  className="textarea textarea-bordered w-full"
                />
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Hidden Test Cases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-sm btn-primary"
              >
                Add Hidden Case
              </button>
            </div>
            
            {hiddenFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeHidden(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
                
                <input
                  {...register(`hiddenTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />
                
                <input
                  {...register(`hiddenTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Code Templates */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>
          
          <div className="space-y-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">
                  {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                </h3>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Initial Code</span>
                  </label>
                  <pre className="bg-base-300 p-4 rounded-lg">
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      className="w-full bg-transparent font-mono"
                      rows={6}
                    />
                  </pre>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Reference Solution</span>
                  </label>
                  <pre className="bg-base-300 p-4 rounded-lg">
                    <textarea
                      {...register(`referenceSolution.${index}.completeCode`)}
                      className="w-full bg-transparent font-mono"
                      rows={6}
                    />
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-control bg-base-200/50 rounded-lg p-4 border-2 border-primary/20">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              checked={skipReferenceValidation}
              onChange={(e) => setSkipReferenceValidation(e.target.checked)}
              className="checkbox checkbox-primary checkbox-lg"
            />
            <span className="label-text font-semibold">Skip reference solution validation (recommended)</span>
          </label>
          <p className="text-sm text-base-content/70 ml-8 mt-1">Keep this checked to create the problem without calling Judge0. Uncheck only if you have a working Judge0/RapidAPI subscription and want to validate solutions before saving. If you see 400 or 403 errors, leave it checked.</p>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;