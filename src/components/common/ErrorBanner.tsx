interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner = ({ message, onRetry }: ErrorBannerProps) => (
  <div
    style={{
      padding: "1rem",
      background: "#fee2e2",
      border: "1px solid #fca5a5",
      borderRadius: "8px",
      marginBottom: "1rem",
    }}
  >
    <strong style={{ color: "#b91c1c" }}>Error:</strong>
    <span style={{ marginLeft: "0.5rem" }}>{message}</span>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        style={{
          marginLeft: "1rem",
          padding: "0.5rem 1rem",
          background: "#b91c1c",
          color: "#fff",
          borderRadius: "4px",
          border: "none",
        }}
      >
        Retry
      </button>
    ) : null}
  </div>
);

