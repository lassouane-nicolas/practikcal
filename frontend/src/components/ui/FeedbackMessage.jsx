function FeedbackMessage({ type = 'error', children }) {
  const isError = type === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`
        rounded-xl
        border
        px-4
        py-3
        text-sm
        ${
          isError
            ? 'border-red-200 bg-red-50 text-[var(--color-error)]'
            : 'border-green-200 bg-green-50 text-green-700'
        }
      `}
    >
      {children}
    </div>
  )
}

export default FeedbackMessage
