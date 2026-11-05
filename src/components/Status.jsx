export default function Status({ children, error }) {
  return <p className={error ? 'status error' : 'status'}>{children}</p>
}
